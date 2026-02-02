import { useEffect } from 'react';

interface UseReviewKeyboardShortcutProps {
  isReadyForQuickReview: boolean;
  isLoadingSRSState: boolean;
  handleNextReview: (difficulty: string) => void;
}

export const useReviewKeyboardShortcut = ({
  isReadyForQuickReview,
  isLoadingSRSState,
  handleNextReview,
}: UseReviewKeyboardShortcutProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isReadyForQuickReview &&
        e.shiftKey &&
        e.key.toLowerCase() === 'f' &&
        !isLoadingSRSState
      ) {
        console.log('Shift+F detected, triggering handleNextReview(4)');
        handleNextReview('4');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReadyForQuickReview, isLoadingSRSState, handleNextReview]);
};
