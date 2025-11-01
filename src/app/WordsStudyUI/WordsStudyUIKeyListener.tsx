'use client';

import { useEffect } from 'react';
import { isNumber } from '@/utils/is-number';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';

const qRewindTime = 3;

const WordsStudyUIKeyListener = ({ handleJumpToSentenceViaKeys }) => {
  const {
    ref,
    handlePausePlay,
    handleRewind,
    isVideoPlaying,
    handleLoopThis3Second,
    handleShiftLoopSentence,
    threeSecondLoopState,
    setThreeSecondLoopState,
    handleLoopThisSentence,
    setContractThreeSecondLoopState,
  } = useWordsStudyUIScreen();

  const handleSlowDownAudio = (isSlow) => {
    if (isSlow) {
      ref.current.playbackRate = 0.75;
    } else {
      ref.current.playbackRate = 1;
    }
  };

  const handleShiftSnippet = (shiftNumber: number) => {
    if (isNumber(threeSecondLoopState) && threeSecondLoopState > 0) {
      // factor in small descrepancy
      const newCurrentNumber = threeSecondLoopState + shiftNumber;
      setThreeSecondLoopState(newCurrentNumber);
    }
  };

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (threeSecondLoopState) {
        if (e.key.toLowerCase() === 'o') {
          handleSlowDownAudio(false);
          return;
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const shiftKey = e.shiftKey;

      // if (
      //   shiftKey &&
      //   e.key.toLowerCase() === 'arrowdown' &&
      //   !threeSecondLoopState
      // ) {
      //   handleLoopThisSentence();
      //   return;
      // }

      if (threeSecondLoopState) {
        // think of properties and array things
        if (threeSecondLoopState) {
          if (shiftKey && e.key.toLowerCase() === '"') {
            handleLoopThis3Second();
            return;
          }
          if (shiftKey && e.key.toLowerCase() === 'arrowright') {
            handleShiftSnippet(0.5);
            return;
          }
          if (shiftKey && e.key.toLowerCase() === 'arrowleft') {
            handleShiftSnippet(-0.5);
            return;
          }

          if (shiftKey && e.key.toLowerCase() === 'arrowup') {
            setContractThreeSecondLoopState((prev) => !prev);
            return;
          }
          if (shiftKey && e.key.toLowerCase() === 'arrowdown') {
            // setContractThreeSecondLoopState(true);
            return;
          }
          return;
        }

        if (e.key.toLowerCase() === 'o') {
          handleSlowDownAudio(true);
          return;
        }

        if (shiftKey && !threeSecondLoopState) {
          if (e.key.toLowerCase() === 'arrowright') {
            handleShiftLoopSentence(true);
          }
        }
      }

      if (e.shiftKey && e.key.toLowerCase() === ' ') {
        handlePausePlay();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === '"') {
        handleLoopThis3Second();
        return;
      }

      if (!isVideoPlaying) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          handleJumpToSentenceViaKeys(-1);
          break;
        case ';':
          handleJumpToSentenceViaKeys(-1);
          break;
        case 's':
          handleJumpToSentenceViaKeys(0);
          break;
        case "'":
          handleJumpToSentenceViaKeys(0);
          break;
        case 'd':
          handleJumpToSentenceViaKeys(1);
          break;
        case '\\':
          handleJumpToSentenceViaKeys(1);
          break;
        case 'q':
          handleRewind(qRewindTime);
          break;
        case 'l':
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
    handleRewind,
    handlePausePlay,
    handleLoopThisSentence,
    handleLoopThis3Second,
    threeSecondLoopState,
    handleShiftSnippet,
    handleSlowDownAudio,
    handleShiftLoopSentence,
    setContractThreeSecondLoopState,
  ]);

  return null;
};

export default WordsStudyUIKeyListener;
