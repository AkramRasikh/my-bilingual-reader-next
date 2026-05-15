// useGamepad.ts
import { useEffect, useRef } from 'react';
import { getButtonMap } from './gamepadButtonMap';
import {
  type Cardinal,
  type HatAxis9DecoderState,
  getDpadStateFromAxes,
  readPhysicalButtons,
  rising,
  falling,
  stepHatAxis9,
} from './readGamepadFrame';
import { InputAction } from './useInputActions';

const dispatchSnippetLoopEvent = (
  name:
    | 'snippet-loop-adjust-length'
    | 'snippet-loop-shift-start'
    | 'snippet-loop-save',
  detail: { delta?: number } = {},
) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

export function useGamepad(
  dispatch: (action: InputAction) => void,
  threeSecondLoopState: number | null,
  isVideoPlaying: boolean,
) {
  const axesPressedRef = useRef<{ [key: string]: boolean }>({});
  const menuFacePrevRef = useRef({
    y: false,
    a: false,
    checker: false,
    minus: false,
    plus: false,
  });
  const gamepadConnectedRef = useRef(false);
  const lrComboFiredRef = useRef(false);
  const lxComboFiredRef = useRef(false);
  const lbComboFiredRef = useRef(false);
  const laComboFiredRef = useRef(false);
  const hatStateRef = useRef<HatAxis9DecoderState>({
    neutral: null,
    maxAbsSeen: 1,
  });
  const hatPrevFrameRef = useRef<Cardinal>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const r3PrevRef = useRef(false);

  useEffect(() => {
    if (!navigator.getGamepads) {
      console.error('❌ Gamepad API not supported in this browser');
      return;
    }

    let rafId: number;

    const handleGamepadConnected = () => {
      gamepadConnectedRef.current = true;
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('🎮 Gamepad disconnected:', e.gamepad.id);
      gamepadConnectedRef.current = false;
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const initialGamepads = navigator.getGamepads();
    const connectedGamepad = Array.from(initialGamepads).find(
      (gp) => gp !== null,
    );
    if (connectedGamepad) {
      gamepadConnectedRef.current = true;
    }

    const loop = () => {
      const gamepads = navigator.getGamepads();
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp) {
        const map = getButtonMap(gp);

        if (!gamepadConnectedRef.current) {
          gamepadConnectedRef.current = true;
        }

        const physical = readPhysicalButtons(gp, map);
        const dpadAxes = getDpadStateFromAxes(gp.axes);
        const hatStep = stepHatAxis9(hatStateRef.current, gp, map);
        hatStateRef.current = hatStep.next;

        const { hat } = hatStep;
        const dpadUp = dpadAxes.up;
        const dpadDown = dpadAxes.down;
        const dpadRight = dpadAxes.right;
        const dpadLeft = dpadAxes.left;

        const hatPrev = hatPrevFrameRef.current;

        if (rising(hat.left, hatPrev.left)) {
          window.dispatchEvent(new CustomEvent('dpad-hat-left-pressed'));
        }

        if (rising(hat.right, hatPrev.right)) {
          window.dispatchEvent(new CustomEvent('dpad-hat-right-pressed'));
        }

        hatPrevFrameRef.current = { ...hat };

        const { l1, l2 } = physical.shoulders;

        if (rising(dpadUp, axesPressedRef.current['dpad-up'])) {
          axesPressedRef.current['dpad-up'] = true;

          if (l1) {
            dispatch('SHRINK_LOOP');
          } else {
            dispatch('REWIND');
          }
        }

        if (falling(dpadUp, axesPressedRef.current['dpad-up'])) {
          axesPressedRef.current['dpad-up'] = false;
        }

        if (rising(dpadDown, axesPressedRef.current['dpad-down'])) {
          axesPressedRef.current['dpad-down'] = true;

          if (l1) {
            dispatch('LOOP_SENTENCE');
          } else if (l2) {
            dispatch('JUMP_CURRENT');
          } else {
            dispatch('FORWARD');
          }
        }

        if (falling(dpadDown, axesPressedRef.current['dpad-down'])) {
          axesPressedRef.current['dpad-down'] = false;
        }

        if (rising(dpadRight, axesPressedRef.current['dpad-right'])) {
          axesPressedRef.current['dpad-right'] = true;

          if (l1) {
            dispatch('SLICE_LOOP');
          } else if (threeSecondLoopState) {
            dispatch('SHIFT_SNIPPET_RIGHT');
          } else {
            dispatch('JUMP_NEXT');
          }
        }

        if (falling(dpadRight, axesPressedRef.current['dpad-right'])) {
          axesPressedRef.current['dpad-right'] = false;
        }

        if (rising(dpadLeft, axesPressedRef.current['dpad-left'])) {
          axesPressedRef.current['dpad-left'] = true;

          if (threeSecondLoopState) {
            dispatch('SHIFT_SNIPPET_LEFT');
          } else {
            dispatch('JUMP_PREV');
          }
        }

        if (falling(dpadLeft, axesPressedRef.current['dpad-left'])) {
          axesPressedRef.current['dpad-left'] = false;
        }

        const { l1: l1Held, r1: r1Held } = physical.shoulders;
        const { x: xHeld, b: bHeld, a: aHeld } = physical.face;

        if (l1Held && r1Held && !lrComboFiredRef.current) {
          dispatch('THREE_SECOND_LOOP');
          lrComboFiredRef.current = true;
        }
        if ((!l1Held || !r1Held) && lrComboFiredRef.current) {
          lrComboFiredRef.current = false;
        }

        if (
          threeSecondLoopState &&
          l1Held &&
          xHeld &&
          !lxComboFiredRef.current
        ) {
          dispatchSnippetLoopEvent('snippet-loop-save');
          lxComboFiredRef.current = true;
        } else if (
          !threeSecondLoopState &&
          l1Held &&
          xHeld &&
          !lxComboFiredRef.current
        ) {
          dispatch('QUICK_SAVE_SNIPPET');
          lxComboFiredRef.current = true;
        }
        if ((!l1Held || !xHeld) && lxComboFiredRef.current) {
          lxComboFiredRef.current = false;
        }

        if (
          !(threeSecondLoopState && isVideoPlaying) &&
          l1Held &&
          bHeld &&
          !lbComboFiredRef.current
        ) {
          dispatch('BREAKDOWN_SENTENCE');
          lbComboFiredRef.current = true;
        }
        if ((!l1Held || !bHeld) && lbComboFiredRef.current) {
          lbComboFiredRef.current = false;
        }

        if (
          !threeSecondLoopState &&
          l1Held &&
          aHeld &&
          !laComboFiredRef.current
        ) {
          dispatch('ADD_MASTER_TO_REVIEW');
          laComboFiredRef.current = true;
        }
        if ((!l1Held || !aHeld) && laComboFiredRef.current) {
          laComboFiredRef.current = false;
        }

        const mfPrev = menuFacePrevRef.current;

        if (rising(physical.face.y, mfPrev.y)) {
          if (threeSecondLoopState) {
            if (l1Held) {
              dispatchSnippetLoopEvent('snippet-loop-adjust-length', {
                delta: -1,
              });
            } else {
              dispatchSnippetLoopEvent('snippet-loop-shift-start', {
                delta: -1,
              });
            }
          }
        }

        if (rising(physical.face.a, mfPrev.a)) {
          if (threeSecondLoopState) {
            if (l1Held) {
              dispatchSnippetLoopEvent('snippet-loop-adjust-length', {
                delta: 1,
              });
            } else {
              dispatchSnippetLoopEvent('snippet-loop-shift-start', {
                delta: 1,
              });
            }
          }
        }

        if (rising(physical.menu.checker, mfPrev.checker)) {
          dispatch('REWIND');
        }

        if (rising(physical.menu.minus, mfPrev.minus)) {
          dispatch('PAUSE_PLAY');
        }

        if (rising(physical.menu.plus, mfPrev.plus)) {
          dispatch('TOGGLE_REVIEW_MODE');
        }

        const r3 = physical.sticks.r3;
        if (rising(r3, r3PrevRef.current)) {
          dispatch('TIMER_PRESS');
        }
        r3PrevRef.current = r3;

        menuFacePrevRef.current = {
          y: physical.face.y,
          a: physical.face.a,
          checker: physical.menu.checker,
          minus: physical.menu.minus,
          plus: physical.menu.plus,
        };
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener(
        'gamepaddisconnected',
        handleGamepadDisconnected,
      );
    };
  }, [dispatch, threeSecondLoopState, isVideoPlaying]);
}
