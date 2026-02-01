// useGamepad.ts
import { useEffect, useRef } from 'react';

export function useGamepad() {
  const pressedRef = useRef<{ [key: number]: boolean }>({});
  const gamepadConnectedRef = useRef(false);
  const debugLoggedRef = useRef(false);
  const loopCountRef = useRef(0);

  useEffect(() => {
    console.log('🎮 useGamepad hook initialized');
    
    // Check if Gamepad API is available
    if (!navigator.getGamepads) {
      console.error('❌ Gamepad API not supported in this browser');
      return;
    }
    console.log('✅ Gamepad API is available');

    let rafId: number;

    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('🎮 Gamepad connected:', e.gamepad.id);
      console.log('   Buttons:', e.gamepad.buttons.length);
      console.log('   Axes:', e.gamepad.axes.length);
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
    console.log('🎮 Initial gamepad check:', initialGamepads);
    const connectedGamepad = Array.from(initialGamepads).find(gp => gp !== null);
    if (connectedGamepad) {
      console.log('🎮 Found already connected gamepad:', connectedGamepad.id);
      gamepadConnectedRef.current = true;
    }

    const loop = () => {
      loopCountRef.current++;
      
      // Log every 300 frames (~5 seconds at 60fps) to show the loop is running
      if (loopCountRef.current % 300 === 0) {
        console.log('🔄 Loop running... (count:', loopCountRef.current, ')');
      }

      const gamepads = navigator.getGamepads();

      // Find the first connected gamepad
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp) {
        // Log gamepad detection once per connection
        if (!gamepadConnectedRef.current) {
          console.log('🎮 Gamepad detected in loop:', gp.id);
          gamepadConnectedRef.current = true;
        }

        // Debug: Log all pressed buttons once
        if (!debugLoggedRef.current) {
          const pressedButtons = gp.buttons
            .map((btn, idx) => (btn.pressed ? idx : -1))
            .filter((idx) => idx !== -1);
          if (pressedButtons.length > 0) {
            console.log('🎮 Buttons currently pressed:', pressedButtons);
            debugLoggedRef.current = true;
          }
        }

        // Check all buttons to find which one is pressed
        gp.buttons.forEach((button, index) => {
          if (button.pressed && !pressedRef.current[index]) {
            console.log(`🎮 Button ${index} pressed`);
            pressedRef.current[index] = true;

            // Trigger on button 0 (typically A button)
            if (index === 0) {
              console.log('✅ A button detected - triggering Shift+F');
              triggerShiftF();
            }
          }

          if (!button.pressed && pressedRef.current[index]) {
            console.log(`🎮 Button ${index} released`);
            pressedRef.current[index] = false;
            debugLoggedRef.current = false; // Allow debug logging again
          }
        });
      } else {
        // No gamepad detected
        if (loopCountRef.current % 300 === 0 && !gamepadConnectedRef.current) {
          console.log('⚠️ No gamepad detected. Press any button on your controller to activate it.');
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    console.log('🎮 Starting gamepad polling loop...');
    loop();

    return () => {
      console.log('🎮 useGamepad hook cleanup');
      cancelAnimationFrame(rafId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener(
        'gamepaddisconnected',
        handleGamepadDisconnected,
      );
    };
  }, []);
}

function triggerShiftF() {
  console.log('⌨️ Dispatching Shift+F keyboard event');
  const event = new KeyboardEvent('keydown', {
    key: 'F',
    code: 'KeyF',
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });

  const dispatched = window.dispatchEvent(event);
  console.log('⌨️ Event dispatched:', dispatched);
}
