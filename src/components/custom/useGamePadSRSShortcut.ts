import { useEffect, useRef } from 'react';
import {
  getButtonMap,
  isGamepadButtonHeld,
} from '@/app/LearningScreen/experimental/gamepadButtonMap';

interface UseGamePadSRSShortcutProps {
  isReadyForQuickReview: boolean;
  isLoadingSRSState: boolean;
  handleNextReview: (difficulty: string) => void;
  handleRemoveReview: () => void;
}

function isSrsComboHeld(
  l2: boolean,
  r2: boolean,
  y: boolean,
  x: boolean,
  b: boolean,
  a: boolean,
): boolean {
  return (
    (l2 && y) || (l2 && x) || (l2 && b) || (l2 && a) || (l2 && r2)
  );
}

export const useGamePadSRSShortcut = ({
  isReadyForQuickReview,
  isLoadingSRSState,
  handleNextReview,
  handleRemoveReview,
}: UseGamePadSRSShortcutProps) => {
  const armedRef = useRef(false);
  const lyComboFiredRef = useRef(false);
  const lxComboFiredRef = useRef(false);
  const lbComboFiredRef = useRef(false);
  const laComboFiredRef = useRef(false);
  const l2r2ComboFiredRef = useRef(false);

  useEffect(() => {
    if (isReadyForQuickReview) {
      armedRef.current = false;
      lyComboFiredRef.current = false;
      lxComboFiredRef.current = false;
      lbComboFiredRef.current = false;
      laComboFiredRef.current = false;
      l2r2ComboFiredRef.current = false;
    }
  }, [isReadyForQuickReview]);

  useEffect(() => {
    if (!navigator.getGamepads) {
      return;
    }

    let rafId: number;

    const loop = () => {
      const gamepads = navigator.getGamepads();
      const gp = Array.from(gamepads).find((gamepad) => gamepad !== null);

      if (gp && isReadyForQuickReview) {
        const map = getButtonMap(gp);
        const buttons = gp.buttons;
        const l2 = isGamepadButtonHeld(buttons, map.L2_BTN);
        const r2 = isGamepadButtonHeld(buttons, map.R2_BTN);
        const y = isGamepadButtonHeld(buttons, map.Y_BTN);
        const x = isGamepadButtonHeld(buttons, map.X_BTN);
        const b = isGamepadButtonHeld(buttons, map.B_BTN);
        const a = isGamepadButtonHeld(buttons, map.A_BTN);
        const comboHeld = isSrsComboHeld(l2, r2, y, x, b, a);

        if (!armedRef.current && !comboHeld) {
          armedRef.current = true;
        }

        if (!l2 || !y) lyComboFiredRef.current = false;
        if (!l2 || !x) lxComboFiredRef.current = false;
        if (!l2 || !b) lbComboFiredRef.current = false;
        if (!l2 || !a) laComboFiredRef.current = false;
        if (!l2 || !r2) l2r2ComboFiredRef.current = false;

        if (armedRef.current && !isLoadingSRSState) {
          if (l2 && y && !lyComboFiredRef.current) {
            handleNextReview('1');
            lyComboFiredRef.current = true;
            armedRef.current = false;
          } else if (l2 && x && !lxComboFiredRef.current) {
            handleNextReview('2');
            lxComboFiredRef.current = true;
            armedRef.current = false;
          } else if (l2 && b && !lbComboFiredRef.current) {
            handleNextReview('3');
            lbComboFiredRef.current = true;
            armedRef.current = false;
          } else if (l2 && a && !laComboFiredRef.current) {
            handleNextReview('4');
            laComboFiredRef.current = true;
            armedRef.current = false;
          } else if (l2 && r2 && !l2r2ComboFiredRef.current) {
            handleRemoveReview();
            l2r2ComboFiredRef.current = true;
            armedRef.current = false;
          }
        }
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
