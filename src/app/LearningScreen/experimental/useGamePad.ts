// useGamepad.ts
import { useEffect, useRef } from 'react';
import { InputAction } from './useInputActions';

const BUTTONS = {
  L1_BTN: 6,
  L2_BTN: 8,
  R1_BTN: 7,
  R2_BTN: 9,
  MINUS_BTN: 10,
  PLUS_BTN: 11,
  CHECKER_BTN: 12,
  Y_BTN: 4,
  X_BTN: 3,
  B_BTN: 1,
  A_BTN: 0,
} as const;

const getDpadState = (axes: readonly number[]) => {
  // Common D-pad axes: vertical 7/9/1, horizontal 6/8/0
  const axis7 = axes[7] || 0;
  const axis9 = axes[9] || 0;
  const axis1 = axes[1] || 0;
  const axis6 = axes[6] || 0;
  const axis8 = axes[8] || 0;
  const axis0 = axes[0] || 0;

  const up = axis7 < -0.5 || axis1 < -0.5;
  const down = axis7 > 0.5 || axis1 > 0.5;
  const right = axis6 > 0.5 || axis8 > 0.5 || axis0 > 0.5;
  const left = axis6 < -0.5 || axis8 < -0.5 || axis0 < -0.5;

  const upAxis = axis7 < -0.5 ? 7 : axis9 < -0.5 ? 9 : 1;
  const downAxis = axis7 > 0.5 ? 7 : axis9 > 0.5 ? 9 : 1;
  const rightAxis = axis6 > 0.5 ? 6 : axis8 > 0.5 ? 8 : 0;
  const leftAxis = axis6 < -0.5 ? 6 : axis8 < -0.5 ? 8 : 0;

  return {
    up,
    down,
    left,
    right,
    axis: {
      up: upAxis,
      down: downAxis,
      left: leftAxis,
      right: rightAxis,
    },
  };
};

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
  const pressedRef = useRef<{ [key: number]: boolean }>({});
  const axesPressedRef = useRef<{ [key: string]: boolean }>({});
  const gamepadConnectedRef = useRef(false);
  const debugLoggedRef = useRef(false);
  const loopCountRef = useRef(0);
  const lButtonHeldRef = useRef(false);
  const rButtonHeldRef = useRef(false);
  const lrComboFiredRef = useRef(false);
  const xButtonHeldRef = useRef(false);
  const lxComboFiredRef = useRef(false);
  const bButtonHeldRef = useRef(false);
  const lbComboFiredRef = useRef(false);
  const aButtonHeldRef = useRef(false);
  const laComboFiredRef = useRef(false);
  const minusButtonHeldRef = useRef(false);
  const plusButtonHeldRef = useRef(false);

  useEffect(() => {
    if (!navigator.getGamepads) {
      console.error('❌ Gamepad API not supported in this browser');
      return;
    }

    let rafId: number;

    const handleGamepadConnected = () => {
      // console.log('🎮 Gamepad connected:', e.gamepad.id);
      // console.log('   Buttons:', e.gamepad.buttons.length);
      // console.log('   Axes:', e.gamepad.axes.length);
      gamepadConnectedRef.current = true;
      debugLoggedRef.current = false; // Reset debug flag
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('🎮 Gamepad disconnected:', e.gamepad.id);
      gamepadConnectedRef.current = false;
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Check for already connected gamepads
    const initialGamepads = navigator.getGamepads();
    // console.log('🎮 Initial gamepad check:', initialGamepads);
    const connectedGamepad = Array.from(initialGamepads).find(
      (gp) => gp !== null,
    );
    if (connectedGamepad) {
      // console.log('🎮 Found already connected gamepad:', connectedGamepad.id);
      gamepadConnectedRef.current = true;
    }

    const loop = () => {
      loopCountRef.current++;

      // Log every 300 frames (~5 seconds at 60fps) to show the loop is running
      if (loopCountRef.current % 300 === 0) {
        // console.log('🔄 Loop running... (count:', loopCountRef.current, ')');
      }

      const gamepads = navigator.getGamepads();

      // Find the first connected gamepad
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp) {
        // Log gamepad detection once per connection
        if (!gamepadConnectedRef.current) {
          // console.log('🎮 Gamepad detected in loop:', gp.id);
          gamepadConnectedRef.current = true;
        }

        // Always log axes when they're not at rest (to help debug which axis is which)
        const activeAxes = gp.axes.some((axis) => Math.abs(axis) > 0.1);
        if (activeAxes && loopCountRef.current % 30 === 0) {
          // console.log(
          //   '## 🎮 Axes values:',
          //   gp.axes.map((v, i) => `[${i}]:${v.toFixed(2)}`),
          // );
        }

        // Debug: Log all pressed buttons once
        if (!debugLoggedRef.current) {
          const pressedButtons = gp.buttons
            .map((btn, idx) => (btn.pressed ? idx : -1))
            .filter((idx) => idx !== -1);
          if (pressedButtons.length > 0) {
            // console.log('## 🎮 Buttons currently pressed:', pressedButtons);
            // console.log('## 🎮 Axes values:', gp.axes);
            debugLoggedRef.current = true;
          }
        }

        const dpad = getDpadState(gp.axes);
        const dpadUp = dpad.up;
        const dpadDown = dpad.down;
        const dpadRight = dpad.right;
        const dpadLeft = dpad.left;

        // Debug down detection
        if (loopCountRef.current % 60 === 0) {
          // console.log('## DEBUG Down check:', {
          //   dpadDown,
          //   'dpad-down pressed?': axesPressedRef.current['dpad-down'],
          // });
        }

        if (dpadUp && !axesPressedRef.current['dpad-up']) {
          console.log(`## 🎮 D-pad Up pressed (axis ${dpad.axis.up})`);
          axesPressedRef.current['dpad-up'] = true;

          // Check if L button is held for combo action
          if (lButtonHeldRef.current) {
            console.log('## ✅ L + Up combo detected - triggering SHRINK_LOOP');
            dispatch('SHRINK_LOOP');
          } else {
            console.log('## ✅ Up button detected - triggering REWIND');
            dispatch('REWIND');
          }
        }

        if (!dpadUp && axesPressedRef.current['dpad-up']) {
          console.log('## 🎮 D-pad Up released');
          axesPressedRef.current['dpad-up'] = false;
          debugLoggedRef.current = false;
        }

        if (dpadDown && !axesPressedRef.current['dpad-down']) {
          axesPressedRef.current['dpad-down'] = true;

          // Check if L button is held for combo action
          if (lButtonHeldRef.current) {
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

        if (!dpadDown && axesPressedRef.current['dpad-down']) {
          // console.log('## 🎮 D-pad Down released - resetting');
          axesPressedRef.current['dpad-down'] = false;
          debugLoggedRef.current = false;
        }

        // Force log down state
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

        if (dpadRight && !axesPressedRef.current['dpad-right']) {
          const whichAxis = dpad.axis.right;
          // console.log(`## 🎮 D-pad Right pressed (axis ${whichAxis})`);
          axesPressedRef.current['dpad-right'] = true;

          // Check if L button is held for combo action
          if (lButtonHeldRef.current) {
            console.log(
              '## ✅ L + Right combo detected - triggering SLICE_LOOP',
            );
            dispatch('SLICE_LOOP');
          } else if (threeSecondLoopState) {
            // When in 3-second loop mode, shift snippet right
            console.log(
              '## ✅ Right detected (in 3s loop) - triggering SHIFT_SNIPPET_RIGHT',
            );
            dispatch('SHIFT_SNIPPET_RIGHT');
          } else {
            // console.log('## ✅ Right detected - triggering JUMP_NEXT');
            dispatch('JUMP_NEXT');
          }
        }

        if (!dpadRight && axesPressedRef.current['dpad-right']) {
          // console.log('## 🎮 D-pad Right released');
          axesPressedRef.current['dpad-right'] = false;
          debugLoggedRef.current = false;
        }

        if (dpadLeft && !axesPressedRef.current['dpad-left']) {
          // console.log(`## 🎮 D-pad Left pressed (axis ${whichAxis})`);
          axesPressedRef.current['dpad-left'] = true;

          if (threeSecondLoopState) {
            // When in 3-second loop mode, shift snippet left
            console.log(
              '## ✅ Left detected (in 3s loop) - triggering SHIFT_SNIPPET_LEFT',
            );
            dispatch('SHIFT_SNIPPET_LEFT');
          } else {
            // console.log('## ✅ Left detected - triggering JUMP_PREV');
            dispatch('JUMP_PREV');
          }
        }

        if (!dpadLeft && axesPressedRef.current['dpad-left']) {
          // console.log('## 🎮 D-pad Left released');
          axesPressedRef.current['dpad-left'] = false;
          debugLoggedRef.current = false;
        }

        // Check all buttons to find which one is pressed
        gp.buttons.forEach((button, index) => {
          // Log ALL button states every second to debug
          if (loopCountRef.current % 60 === 0 && button.pressed) {
            // console.log(
            //   `## 🔍 Button ${index} is currently pressed (value: ${button.value})`,
            // );
          }

          // Track L1 button state
          if (index === BUTTONS.L1_BTN) {
            lButtonHeldRef.current = button.pressed;
          }

          // Track R1 button state
          if (index === BUTTONS.R1_BTN) {
            rButtonHeldRef.current = button.pressed;
          }

          // Track X button state
          if (index === BUTTONS.X_BTN) {
            xButtonHeldRef.current = button.pressed;
          }

          // Track B button state
          if (index === BUTTONS.B_BTN) {
            bButtonHeldRef.current = button.pressed;
          }

          // Track A button state
          if (index === BUTTONS.A_BTN) {
            aButtonHeldRef.current = button.pressed;
          }

          // Track MINUS button state
          if (index === BUTTONS.MINUS_BTN) {
            minusButtonHeldRef.current = button.pressed;
          }

          // Track PLUS button state
          if (index === BUTTONS.PLUS_BTN) {
            plusButtonHeldRef.current = button.pressed;
          }

          // Check for L+R combo (both pressed simultaneously)
          if (
            lButtonHeldRef.current &&
            rButtonHeldRef.current &&
            !lrComboFiredRef.current
          ) {
            console.log(
              '## ✅ L + R combo detected - triggering THREE_SECOND_LOOP',
            );
            dispatch('THREE_SECOND_LOOP');
            lrComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if (
            (!lButtonHeldRef.current || !rButtonHeldRef.current) &&
            lrComboFiredRef.current
          ) {
            lrComboFiredRef.current = false;
          }

          // Check for L+X combo (both pressed simultaneously)
          if (
            threeSecondLoopState &&
            lButtonHeldRef.current &&
            xButtonHeldRef.current &&
            !lxComboFiredRef.current
          ) {
            console.log(
              '## ✅ L + X combo detected - triggering snippet-loop-save',
            );
            dispatchSnippetLoopEvent('snippet-loop-save');
            lxComboFiredRef.current = true;
          } else if (
            !threeSecondLoopState &&
            lButtonHeldRef.current &&
            xButtonHeldRef.current &&
            !lxComboFiredRef.current
          ) {
            console.log(
              '## ✅ L + X combo detected - triggering QUICK_SAVE_SNIPPET',
            );
            dispatch('QUICK_SAVE_SNIPPET');
            lxComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if (
            (!lButtonHeldRef.current || !xButtonHeldRef.current) &&
            lxComboFiredRef.current
          ) {
            lxComboFiredRef.current = false;
          }

          // Check for L+B combo (both pressed simultaneously)
          if (
            !(threeSecondLoopState && isVideoPlaying) &&
            lButtonHeldRef.current &&
            bButtonHeldRef.current &&
            !lbComboFiredRef.current
          ) {
            console.log(
              '## ✅ L + B combo detected - triggering BREAKDOWN_SENTENCE',
            );
            dispatch('BREAKDOWN_SENTENCE');
            lbComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if (
            (!lButtonHeldRef.current || !bButtonHeldRef.current) &&
            lbComboFiredRef.current
          ) {
            lbComboFiredRef.current = false;
          }

          // Check for L+A combo (both pressed simultaneously)
          if (
            !threeSecondLoopState &&
            lButtonHeldRef.current &&
            aButtonHeldRef.current &&
            !laComboFiredRef.current
          ) {
            console.log(
              '## ✅ L + A combo detected - triggering ADD_MASTER_TO_REVIEW',
            );
            dispatch('ADD_MASTER_TO_REVIEW');
            laComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if (
            (!lButtonHeldRef.current || !aButtonHeldRef.current) &&
            laComboFiredRef.current
          ) {
            laComboFiredRef.current = false;
          }

          if (button.pressed && !pressedRef.current[index]) {
            console.log(`## 🎮 Button ${index} pressed`);
            pressedRef.current[index] = true;

            if (threeSecondLoopState) {
              if (index === BUTTONS.Y_BTN) {
                if (lButtonHeldRef.current) {
                  dispatchSnippetLoopEvent('snippet-loop-adjust-length', {
                    delta: -1,
                  });
                } else {
                  dispatchSnippetLoopEvent('snippet-loop-shift-start', {
                    delta: -1,
                  });
                }
                return;
              }
              if (index === BUTTONS.A_BTN) {
                if (lButtonHeldRef.current) {
                  dispatchSnippetLoopEvent('snippet-loop-adjust-length', {
                    delta: 1,
                  });
                } else {
                  dispatchSnippetLoopEvent('snippet-loop-shift-start', {
                    delta: 1,
                  });
                }
                return;
              }
            }

            // Map buttons to actions
            // Trigger on CHECKER button
            if (index === BUTTONS.CHECKER_BTN) {
              // console.log(`## ✅ Button ${index} detected - triggering REWIND`);
              dispatch('REWIND');
            } else if (index === BUTTONS.MINUS_BTN) {
              console.log(
                `## ✅ Button ${index} detected - triggering PAUSE_PLAY`,
              );
              dispatch('PAUSE_PLAY');
            } else if (index === BUTTONS.PLUS_BTN) {
              console.log(
                `## ✅ Button ${index} detected - triggering TOGGLE_REVIEW_MODE`,
              );
              dispatch('TOGGLE_REVIEW_MODE');
            } else if (index === BUTTONS.L1_BTN) {
              console.log('## 🎮 L button pressed - ready for combo');
            } else {
              // console.log(
              //   `## ❌ Button ${index} has no action assigned - check if this is D-pad Down`,
              // );
            }
          }

          if (!button.pressed && pressedRef.current[index]) {
            console.log(`## 🎮 Button ${index} released`);
            pressedRef.current[index] = false;
            debugLoggedRef.current = false; // Allow debug logging again

            if (index === BUTTONS.L1_BTN) {
              console.log('## 🎮 L button released');
            }
          }
        });
      } else {
        // No gamepad detected
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
