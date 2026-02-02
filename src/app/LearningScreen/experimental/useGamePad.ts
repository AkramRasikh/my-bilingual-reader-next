// useGamepad.ts
import { useEffect, useRef } from 'react';
import { InputAction } from './useInputActions';

export function useGamepad(dispatch: (action: InputAction) => void) {
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

        // Check D-pad via axes - 8BitDo Micro typically uses different axes
        // Try common D-pad vertical axes: 7, 9, or 1 (-1 = up, +1 = down)
        const axis7 = gp.axes[7] || 0;
        const axis9 = gp.axes[9] || 0;
        const axis1 = gp.axes[1] || 0;

        // Try common D-pad horizontal axes: 6, 8, or 0 (-1 = left, +1 = right)
        const axis6 = gp.axes[6] || 0;
        const axis8 = gp.axes[8] || 0;
        const axis0 = gp.axes[0] || 0;

        const dpadUp = axis7 < -0.5 || axis1 < -0.5;
        const dpadDown = axis7 > 0.5 || axis1 > 0.5;
        const dpadRight = axis6 > 0.5 || axis8 > 0.5 || axis0 > 0.5;
        const dpadLeft = axis6 < -0.5 || axis8 < -0.5 || axis0 < -0.5;

        // Debug down detection
        if (loopCountRef.current % 60 === 0) {
          // console.log('## DEBUG Down check:', {
          //   axis7,
          //   axis9,
          //   axis1,
          //   'axis7 > 0.5': axis7 > 0.5,
          //   'axis9 > 0.5': axis9 > 0.5,
          //   'axis1 > 0.5': axis1 > 0.5,
          //   dpadDown,
          //   'dpad-down pressed?': axesPressedRef.current['dpad-down'],
          // });
        }

        if (dpadUp && !axesPressedRef.current['dpad-up']) {
          const whichAxis = axis7 < -0.5 ? 7 : axis9 < -0.5 ? 9 : 1;
          console.log(`## 🎮 D-pad Up pressed (axis ${whichAxis})`);
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
          const whichAxis = axis7 > 0.5 ? 7 : axis9 > 0.5 ? 9 : 1;
          axesPressedRef.current['dpad-down'] = true;
          
          // Check if L button is held for combo action
          if (lButtonHeldRef.current) {
            console.log('## ✅ L + Down combo detected - triggering LOOP_SENTENCE');
            dispatch('LOOP_SENTENCE');
          } else {
            // console.log('## ✅ Down detected - triggering JUMP_CURRENT (replay)');
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
            axis9,
          );
        }

        if (dpadRight && !axesPressedRef.current['dpad-right']) {
          const whichAxis = axis6 > 0.5 ? 6 : axis8 > 0.5 ? 8 : 0;
          // console.log(`## 🎮 D-pad Right pressed (axis ${whichAxis})`);
          axesPressedRef.current['dpad-right'] = true;
          
          // Check if L button is held for combo action
          if (lButtonHeldRef.current) {
            console.log('## ✅ L + Right combo detected - triggering SLICE_LOOP');
            dispatch('SLICE_LOOP');
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
          const whichAxis = axis6 < -0.5 ? 6 : axis8 < -0.5 ? 8 : 0;
          // console.log(`## 🎮 D-pad Left pressed (axis ${whichAxis})`);
          axesPressedRef.current['dpad-left'] = true;
          // console.log('## ✅ Left detected - triggering JUMP_PREV');
          dispatch('JUMP_PREV');
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

          // Track L button state (button 6 on 8BitDo Micro)
          if (index === 6) {
            lButtonHeldRef.current = button.pressed;
          }

          // Track R button state (button 7 on 8BitDo Micro)
          if (index === 7) {
            rButtonHeldRef.current = button.pressed;
          }

          // Track X button state (button 3 on 8BitDo Micro)
          if (index === 3) {
            xButtonHeldRef.current = button.pressed;
          }

          // Check for L+R combo (both pressed simultaneously)
          if (lButtonHeldRef.current && rButtonHeldRef.current && !lrComboFiredRef.current) {
            console.log('## ✅ L + R combo detected - triggering THREE_SECOND_LOOP');
            dispatch('THREE_SECOND_LOOP');
            lrComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if ((!lButtonHeldRef.current || !rButtonHeldRef.current) && lrComboFiredRef.current) {
            lrComboFiredRef.current = false;
          }

          // Check for L+X combo (both pressed simultaneously)
          if (lButtonHeldRef.current && xButtonHeldRef.current && !lxComboFiredRef.current) {
            console.log('## ✅ L + X combo detected - triggering QUICK_SAVE_SNIPPET');
            dispatch('QUICK_SAVE_SNIPPET');
            lxComboFiredRef.current = true;
          }

          // Reset combo flag when either button is released
          if ((!lButtonHeldRef.current || !xButtonHeldRef.current) && lxComboFiredRef.current) {
            lxComboFiredRef.current = false;
          }

          if (button.pressed && !pressedRef.current[index]) {
            console.log(`## 🎮 Button ${index} pressed`);
            pressedRef.current[index] = true;

            // Map buttons to actions
            // Trigger on button 12 (typically D-pad Up) OR button 0 for testing
            if (index === 12 || index === 0) {
              // console.log(`## ✅ Button ${index} detected - triggering REWIND`);
              dispatch('REWIND');
            } else if (index === 6) {
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
            
            if (index === 6) {
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
  }, [dispatch]);
}
