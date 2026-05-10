import { useEffect, useRef } from 'react';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';

interface UseGamePadSRSShortcutProps {
  isReadyForQuickReview: boolean;
  isLoadingSRSState: boolean;
  handleNextReview: (difficulty: string) => void;
  handleRemoveReview: () => void;
}

export const useGamePadSRSShortcut = ({
  isReadyForQuickReview,
  isLoadingSRSState,
  handleNextReview,
  handleRemoveReview,
}: UseGamePadSRSShortcutProps) => {
  const l2ButtonHeldRef = useRef(false);
  const r2ButtonHeldRef = useRef(false);
  const yButtonHeldRef = useRef(false);
  const xButtonHeldRef = useRef(false);
  const bButtonHeldRef = useRef(false);
  const aButtonHeldRef = useRef(false);
  const lyComboFiredRef = useRef(false);
  const lxComboFiredRef = useRef(false);
  const lbComboFiredRef = useRef(false);
  const laComboFiredRef = useRef(false);
  const l2r2ComboFiredRef = useRef(false);

  useEffect(() => {
    if (!navigator.getGamepads) {
      return;
    }

    let rafId: number;

    const loop = () => {
      const gamepads = navigator.getGamepads();
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp && isReadyForQuickReview && !isLoadingSRSState) {
        const map = getButtonMap(gp);
        gp.buttons.forEach((button, index) => {
          if (index === map.L2_BTN) {
            l2ButtonHeldRef.current = button.pressed;
          }

          if (index === map.R2_BTN) {
            r2ButtonHeldRef.current = button.pressed;
          }

          if (index === map.Y_BTN) {
            yButtonHeldRef.current = button.pressed;
          }

          if (index === map.X_BTN) {
            xButtonHeldRef.current = button.pressed;
          }

          if (index === map.B_BTN) {
            bButtonHeldRef.current = button.pressed;
          }

          if (index === map.A_BTN) {
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

          if (
            l2ButtonHeldRef.current &&
            r2ButtonHeldRef.current &&
            !l2r2ComboFiredRef.current
          ) {
            handleRemoveReview();
            l2r2ComboFiredRef.current = true;
          }

          // Reset L2+R2 combo flag when either button is released
          if (
            (!l2ButtonHeldRef.current || !r2ButtonHeldRef.current) &&
            l2r2ComboFiredRef.current
          ) {
            l2r2ComboFiredRef.current = false;
          }
        });
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    isReadyForQuickReview,
    isLoadingSRSState,
    handleNextReview,
    handleRemoveReview,
  ]);
};
