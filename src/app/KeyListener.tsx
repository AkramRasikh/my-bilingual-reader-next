'use client';

import { useEffect } from 'react';

const qRewindTime = 3;

type Props = {
  isVideoPlaying: boolean;
};

const KeyListener = ({
  isVideoPlaying,
  handleJumpToSentenceViaKeys,
  handleBreakdownMasterSentence,
  handleRewind,
  handleOpenBreakdownSentence,
  handlePausePlay,
  setIsPressDownShiftState,
  handleLoopThisSentence,
}: Props) => {
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsPressDownShiftState(false);
        return;
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // SHIFT + B
      if (e.shiftKey && e.key.toLowerCase() === 'b') {
        handleBreakdownMasterSentence();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'n') {
        handleOpenBreakdownSentence();
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === ' ') {
        handlePausePlay();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'm') {
        handleLoopThisSentence();
        return;
      }
      if (e.shiftKey) {
        setIsPressDownShiftState(true);
        return;
      }

      if (!isVideoPlaying) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          handleJumpToSentenceViaKeys(-1);
          break;
        case 's':
          handleJumpToSentenceViaKeys(0);
          break;
        case 'd':
          handleJumpToSentenceViaKeys(1);
          break;
        case 'q':
          handleRewind(qRewindTime);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleJumpToSentenceViaKeys,
    handleBreakdownMasterSentence,
    handleRewind,
    handleOpenBreakdownSentence,
    handlePausePlay,
    setIsPressDownShiftState,
    handleLoopThisSentence,
  ]);

  return null;
};

export default KeyListener;
