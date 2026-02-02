import { useEffect, useRef } from 'react';

interface UseGamePadSRSShortcutProps {
  isReadyForQuickReview: boolean;
  isLoadingSRSState: boolean;
  handleNextReview: (difficulty: string) => void;
}

export const useGamePadSRSShortcut = ({
  isReadyForQuickReview,
  isLoadingSRSState,
  handleNextReview,
}: UseGamePadSRSShortcutProps) => {
  const l2ButtonHeldRef = useRef(false);
  const yButtonHeldRef = useRef(false);
  const xButtonHeldRef = useRef(false);
  const bButtonHeldRef = useRef(false);
  const aButtonHeldRef = useRef(false);
  const lyComboFiredRef = useRef(false);
  const lxComboFiredRef = useRef(false);
  const lbComboFiredRef = useRef(false);
  const laComboFiredRef = useRef(false);

  useEffect(() => {
    if (!navigator.getGamepads) {
      return;
    }

    let rafId: number;

    const loop = () => {
      const gamepads = navigator.getGamepads();
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp && isReadyForQuickReview && !isLoadingSRSState) {
        gp.buttons.forEach((button, index) => {
          // Track L2 button state (button 8)
          if (index === 8) {
            l2ButtonHeldRef.current = button.pressed;
          }

          // Track Y button state (button 2)
          if (index === 4) {
            yButtonHeldRef.current = button.pressed;
          }

          // Track X button state (button 3)
          if (index === 3) {
            xButtonHeldRef.current = button.pressed;
          }

          // Track B button state (button 1)
          if (index === 1) {
            bButtonHeldRef.current = button.pressed;
          }

          // Track A button state (button 0)
          if (index === 0) {
            aButtonHeldRef.current = button.pressed;
          }

          // Check for L2+Y combo - Again ('1')
          if (
            l2ButtonHeldRef.current &&
            yButtonHeldRef.current &&
            !lyComboFiredRef.current
          ) {
            console.log('## ✅ L2 + Y combo detected - triggering Again (1)');
            handleNextReview('1');
            lyComboFiredRef.current = true;
          }

          // Reset L2+Y combo flag when either button is released
          if (
            (!l2ButtonHeldRef.current || !yButtonHeldRef.current) &&
            lyComboFiredRef.current
          ) {
            lyComboFiredRef.current = false;
          }

          // Check for L2+X combo - Hard ('2')
          if (
            l2ButtonHeldRef.current &&
            xButtonHeldRef.current &&
            !lxComboFiredRef.current
          ) {
            console.log('## ✅ L2 + X combo detected - triggering Hard (2)');
            handleNextReview('2');
            lxComboFiredRef.current = true;
          }

          // Reset L2+X combo flag when either button is released
          if (
            (!l2ButtonHeldRef.current || !xButtonHeldRef.current) &&
            lxComboFiredRef.current
          ) {
            lxComboFiredRef.current = false;
          }

          // Check for L2+B combo - Good ('3')
          if (
            l2ButtonHeldRef.current &&
            bButtonHeldRef.current &&
            !lbComboFiredRef.current
          ) {
            console.log('## ✅ L2 + B combo detected - triggering Good (3)');
            handleNextReview('3');
            lbComboFiredRef.current = true;
          }

          // Reset L2+B combo flag when either button is released
          if (
            (!l2ButtonHeldRef.current || !bButtonHeldRef.current) &&
            lbComboFiredRef.current
          ) {
            lbComboFiredRef.current = false;
          }

          // Check for L2+A combo - Easy ('4')
          if (
            l2ButtonHeldRef.current &&
            aButtonHeldRef.current &&
            !laComboFiredRef.current
          ) {
            console.log('## ✅ L2 + A combo detected - triggering Easy (4)');
            handleNextReview('4');
            laComboFiredRef.current = true;
          }

          // Reset L2+A combo flag when either button is released
          if (
            (!l2ButtonHeldRef.current || !aButtonHeldRef.current) &&
            laComboFiredRef.current
          ) {
            laComboFiredRef.current = false;
          }
        });
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isReadyForQuickReview, isLoadingSRSState, handleNextReview]);
};
