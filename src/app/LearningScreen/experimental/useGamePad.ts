// useGamepad.ts
import { useEffect, useRef } from 'react';
import { getButtonMap } from './gamepadButtonMap';
import {
  type Cardinal,
  type HatAxis9DecoderState,
  getDpadStateFromAxes,
  readPhysicalButtons,
  readRightStickCardinals,
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

const rStickEdgeLog = (
  dir: keyof Cardinal,
  rs: Cardinal,
  prev: Cardinal,
  label: string,
) => {
  if (rising(rs[dir], prev[dir])) {
    console.log(`## 🎮 R-stick ${label} pressed`);
  }
  if (falling(rs[dir], prev[dir])) {
    console.log(`## 🎮 R-stick ${label} released`);
  }
};

export function useGamepad(
  dispatch: (action: InputAction) => void,
  threeSecondLoopState: number | null,
  isVideoPlaying: boolean,
) {
  const axesPressedRef = useRef<{ [key: string]: boolean }>({});
  const btnPrevRef = useRef<boolean[]>([]);
  const menuFaceL1PrevRef = useRef({
    y: false,
    a: false,
    checker: false,
    minus: false,
    plus: false,
    l1: false,
  });
  const gamepadConnectedRef = useRef(false);
  const debugLoggedRef = useRef(false);
  const loopCountRef = useRef(0);
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
  const rStickPrevRef = useRef<Cardinal>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!navigator.getGamepads) {
      console.error('❌ Gamepad API not supported in this browser');
      return;
    }

    let rafId: number;

    const handleGamepadConnected = () => {
      gamepadConnectedRef.current = true;
      debugLoggedRef.current = false;
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
      loopCountRef.current++;

      if (loopCountRef.current % 300 === 0) {
        // console.log('🔄 Loop running... (count:', loopCountRef.current, ')');
      }

      const gamepads = navigator.getGamepads();
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp) {
        const map = getButtonMap(gp);

        if (!gamepadConnectedRef.current) {
          gamepadConnectedRef.current = true;
        }

        const activeAxes = gp.axes.some((axis) => Math.abs(axis) > 0.1);
        if (activeAxes && loopCountRef.current % 30 === 0) {
          // console.log(
          //   '## 🎮 Axes values:',
          //   gp.axes.map((v, i) => `[${i}]:${v.toFixed(2)}`),
          // );
        }

        if (!debugLoggedRef.current) {
          const pressedButtons = gp.buttons
            .map((btn, idx) => (btn.pressed ? idx : -1))
            .filter((idx) => idx !== -1);
          if (pressedButtons.length > 0) {
            debugLoggedRef.current = true;
          }
        }

        const physical = readPhysicalButtons(gp, map);
        const dpadAxes = getDpadStateFromAxes(gp.axes);
        const hatStep = stepHatAxis9(hatStateRef.current, gp, map);
        hatStateRef.current = hatStep.next;

        const { hat, dpadBtn } = hatStep;
        const dpadUp = dpadAxes.up;
        const dpadDown = dpadAxes.down;
        const dpadRight = dpadAxes.right;
        const dpadLeft = dpadAxes.left;

        const hatPrev = hatPrevFrameRef.current;

        if (rising(hat.up, hatPrev.up)) {
          console.log('## 🎮 D-pad hat UP pressed');
        }
        if (falling(hat.up, hatPrev.up)) {
          // console.log('## 🎮 D-pad hat UP released');
        }

        if (rising(hat.down, hatPrev.down)) {
          console.log('## 🎮 D-pad hat DOWN pressed');
        }
        if (falling(hat.down, hatPrev.down)) {
          // console.log('## 🎮 D-pad hat DOWN released');
        }

        if (rising(hat.left, hatPrev.left)) {
          console.log('## 🎮 D-pad hat LEFT pressed');
          window.dispatchEvent(new CustomEvent('dpad-hat-left-pressed'));
        }
        if (falling(hat.left, hatPrev.left)) {
          // console.log('## 🎮 D-pad hat LEFT released');
          window.dispatchEvent(new CustomEvent('dpad-hat-left-released'));
        }

        if (rising(hat.right, hatPrev.right)) {
          console.log('## 🎮 D-pad hat RIGHT pressed');
          window.dispatchEvent(new CustomEvent('dpad-hat-right-pressed'));
        }
        if (falling(hat.right, hatPrev.right)) {
          // console.log('## 🎮 D-pad hat RIGHT released');
          window.dispatchEvent(new CustomEvent('dpad-hat-right-released'));
        }

        hatPrevFrameRef.current = { ...hat };

        const rs = readRightStickCardinals(gp, map);
        const rsPrev = rStickPrevRef.current;
        rStickEdgeLog('up', rs, rsPrev, 'UP');
        rStickEdgeLog('down', rs, rsPrev, 'DOWN');
        rStickEdgeLog('left', rs, rsPrev, 'LEFT');
        rStickEdgeLog('right', rs, rsPrev, 'RIGHT');
        rStickPrevRef.current = { ...rs };

        if (loopCountRef.current % 60 === 0) {
          // console.log('## DEBUG Down check:', {
          //   dpadDown,
          //   'dpad-down pressed?': axesPressedRef.current['dpad-down'],
          // });
        }

        const l1 = physical.shoulders.l1;

        if (rising(dpadUp, axesPressedRef.current['dpad-up'])) {
          const upSrc =
            dpadAxes.up && dpadBtn.up
              ? `axis ${dpadAxes.axis.up}+btn`
              : dpadBtn.up
                ? 'btn'
                : `axis ${dpadAxes.axis.up}`;
          console.log(`## 🎮 D-pad Up pressed (${upSrc})`);
          axesPressedRef.current['dpad-up'] = true;

          if (l1) {
            console.log('## ✅ L + Up combo detected - triggering SHRINK_LOOP');
            dispatch('SHRINK_LOOP');
          } else {
            console.log('## ✅ Up button detected - triggering REWIND');
            dispatch('REWIND');
          }
        }

        if (falling(dpadUp, axesPressedRef.current['dpad-up'])) {
          console.log('## 🎮 D-pad Up released');
          axesPressedRef.current['dpad-up'] = false;
          debugLoggedRef.current = false;
        }

        if (rising(dpadDown, axesPressedRef.current['dpad-down'])) {
          axesPressedRef.current['dpad-down'] = true;

          if (l1) {
            console.log(
              '## ✅ L + Down combo detected - triggering LOOP_SENTENCE',
            );
            dispatch('LOOP_SENTENCE');
          } else {
            console.log(
              '## ✅ Down detected - triggering JUMP_CURRENT (replay)',
            );
            dispatch('JUMP_CURRENT');
          }
        }

        if (falling(dpadDown, axesPressedRef.current['dpad-down'])) {
          axesPressedRef.current['dpad-down'] = false;
          debugLoggedRef.current = false;
        }

        if (
          loopCountRef.current % 60 === 0 &&
          axesPressedRef.current['dpad-down']
        ) {
          console.log(
            '## ⚠️ Down is stuck pressed. dpadDown value:',
            dpadDown,
            'axis9:',
            gp.axes[9] || 0,
          );
        }

        if (rising(dpadRight, axesPressedRef.current['dpad-right'])) {
          axesPressedRef.current['dpad-right'] = true;

          if (l1) {
            console.log(
              '## ✅ L + Right combo detected - triggering SLICE_LOOP',
            );
            dispatch('SLICE_LOOP');
          } else if (threeSecondLoopState) {
            console.log(
              '## ✅ Right detected (in 3s loop) - triggering SHIFT_SNIPPET_RIGHT',
            );
            dispatch('SHIFT_SNIPPET_RIGHT');
          } else {
            dispatch('JUMP_NEXT');
          }
        }

        if (falling(dpadRight, axesPressedRef.current['dpad-right'])) {
          axesPressedRef.current['dpad-right'] = false;
          debugLoggedRef.current = false;
        }

        if (rising(dpadLeft, axesPressedRef.current['dpad-left'])) {
          axesPressedRef.current['dpad-left'] = true;

          if (threeSecondLoopState) {
            console.log(
              '## ✅ Left detected (in 3s loop) - triggering SHIFT_SNIPPET_LEFT',
            );
            dispatch('SHIFT_SNIPPET_LEFT');
          } else {
            dispatch('JUMP_PREV');
          }
        }

        if (falling(dpadLeft, axesPressedRef.current['dpad-left'])) {
          axesPressedRef.current['dpad-left'] = false;
          debugLoggedRef.current = false;
        }

        const { l1: l1Held, r1: r1Held } = physical.shoulders;
        const { x: xHeld, b: bHeld, a: aHeld } = physical.face;

        if (l1Held && r1Held && !lrComboFiredRef.current) {
          console.log(
            '## ✅ L + R combo detected - triggering THREE_SECOND_LOOP',
          );
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
          console.log(
            '## ✅ L + X combo detected - triggering snippet-loop-save',
          );
          dispatchSnippetLoopEvent('snippet-loop-save');
          lxComboFiredRef.current = true;
        } else if (
          !threeSecondLoopState &&
          l1Held &&
          xHeld &&
          !lxComboFiredRef.current
        ) {
          console.log(
            '## ✅ L + X combo detected - triggering QUICK_SAVE_SNIPPET',
          );
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
          console.log(
            '## ✅ L + B combo detected - triggering BREAKDOWN_SENTENCE',
          );
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
          console.log(
            '## ✅ L + A combo detected - triggering ADD_MASTER_TO_REVIEW',
          );
          dispatch('ADD_MASTER_TO_REVIEW');
          laComboFiredRef.current = true;
        }
        if ((!l1Held || !aHeld) && laComboFiredRef.current) {
          laComboFiredRef.current = false;
        }

        const mfPrev = menuFaceL1PrevRef.current;

        if (rising(physical.face.y, mfPrev.y)) {
          console.log(`## 🎮 Button ${map.Y_BTN} pressed`);
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
          console.log(`## 🎮 Button ${map.A_BTN} pressed`);
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
          console.log(`## 🎮 Button ${map.CHECKER_BTN} pressed`);
          dispatch('REWIND');
        }

        if (rising(physical.menu.minus, mfPrev.minus)) {
          console.log(`## 🎮 Button ${map.MINUS_BTN} pressed`);
          console.log(
            `## ✅ Button ${map.MINUS_BTN} detected - triggering PAUSE_PLAY`,
          );
          dispatch('PAUSE_PLAY');
        }

        if (rising(physical.menu.plus, mfPrev.plus)) {
          console.log(`## 🎮 Button ${map.PLUS_BTN} pressed`);
          console.log(
            `## ✅ Button ${map.PLUS_BTN} detected - triggering TOGGLE_REVIEW_MODE`,
          );
          dispatch('TOGGLE_REVIEW_MODE');
        }

        if (rising(physical.shoulders.l1, mfPrev.l1)) {
          console.log(`## 🎮 Button ${map.L1_BTN} pressed`);
          console.log('## 🎮 L button pressed - ready for combo');
        }

        if (falling(physical.shoulders.l1, mfPrev.l1)) {
          console.log(`## 🎮 Button ${map.L1_BTN} released`);
          console.log('## 🎮 L button released');
          debugLoggedRef.current = false;
        }

        menuFaceL1PrevRef.current = {
          y: physical.face.y,
          a: physical.face.a,
          checker: physical.menu.checker,
          minus: physical.menu.minus,
          plus: physical.menu.plus,
          l1: physical.shoulders.l1,
        };

        const buttonWasPressed = btnPrevRef.current;
        const handledForRising = new Set([
          map.Y_BTN,
          map.A_BTN,
          map.CHECKER_BTN,
          map.MINUS_BTN,
          map.PLUS_BTN,
          map.L1_BTN,
        ]);

        gp.buttons.forEach((button, index) => {
          if (loopCountRef.current % 60 === 0 && button.pressed) {
            // console.log(
            //   `## 🔍 Button ${index} is currently pressed (value: ${button.value})`,
            // );
          }

          const pressed = button.pressed;
          const wasPressed = buttonWasPressed[index] ?? false;

          if (rising(pressed, wasPressed) && !handledForRising.has(index)) {
            console.log(`## 🎮 Button ${index} pressed`);
          }

          if (falling(pressed, wasPressed)) {
            if (index !== map.L1_BTN) {
              console.log(`## 🎮 Button ${index} released`);
            }
            debugLoggedRef.current = false;
          }
        });

        btnPrevRef.current = gp.buttons.map((b) => b.pressed);
      } else {
        if (loopCountRef.current % 300 === 0 && !gamepadConnectedRef.current) {
          // console.log(
          //   '## ⚠️ No gamepad detected. Press any button on your controller to activate it.',
          // );
        }
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
