// useGamepad.ts
import { useEffect, useRef } from 'react';
import { InputAction } from './useInputActions';

export function useGamepad(dispatch: (action: InputAction) => void) {
  const pressedRef = useRef<{ [key: number]: boolean }>({});
  const axesPressedRef = useRef<{ [key: string]: boolean }>({});
  const gamepadConnectedRef = useRef(false);
  const debugLoggedRef = useRef(false);
  const loopCountRef = useRef(0);

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
            console.log('## 🎮 Buttons currently pressed:', pressedButtons);
            console.log('## 🎮 Axes values:', gp.axes);
            debugLoggedRef.current = true;
          }
        }

        // Check D-pad via axes - 8BitDo Micro typically uses different axes
        // Try common D-pad vertical axes: 7, 9, or 1 (-1 = up, +1 = down)
        const axis7 = gp.axes[7] || 0;
        const axis9 = gp.axes[9] || 0;
        const axis1 = gp.axes[1] || 0;

        const dpadUp = axis7 < -0.5 || axis9 < -0.5 || axis1 < -0.5;

        if (dpadUp && !axesPressedRef.current['dpad-up']) {
          const whichAxis = axis7 < -0.5 ? 7 : axis9 < -0.5 ? 9 : 1;
          // console.log(`## 🎮 D-pad Up pressed (axis ${whichAxis})`);
          axesPressedRef.current['dpad-up'] = true;
          // console.log('## ✅ Up button detected - triggering REWIND');
          dispatch('REWIND');
        }

        if (!dpadUp && axesPressedRef.current['dpad-up']) {
          // console.log('## 🎮 D-pad Up released');
          axesPressedRef.current['dpad-up'] = false;
          debugLoggedRef.current = false;
        }

        // Check all buttons to find which one is pressed
        gp.buttons.forEach((button, index) => {
          if (button.pressed && !pressedRef.current[index]) {
            console.log(`## 🎮 Button ${index} pressed`);
            pressedRef.current[index] = true;

            // Map buttons to actions
            // Trigger on button 12 (typically D-pad Up) OR button 0 for testing
            if (index === 12 || index === 0) {
              // console.log(`## ✅ Button ${index} detected - triggering REWIND`);
              dispatch('REWIND');
            } else {
              // console.log(
              //   `## ❌ Button ${index} has no action assigned - try assigning this button if it's D-pad Up`,
              // );
            }
          }

          if (!button.pressed && pressedRef.current[index]) {
            console.log(`## 🎮 Button ${index} released`);
            pressedRef.current[index] = false;
            debugLoggedRef.current = false; // Allow debug logging again
          }
        });
      } else {
        // No gamepad detected
        if (loopCountRef.current % 300 === 0 && !gamepadConnectedRef.current) {
          console.log(
            '## ⚠️ No gamepad detected. Press any button on your controller to activate it.',
          );
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
