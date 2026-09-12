'use client';

import { useEffect } from 'react';
import useLearningScreen from './useLearningScreen';
import { isNumber } from '@/utils/is-number';

const LearningScreenKeyListener = () => {
  const {
    handleRewind,
    handleJumpToSentenceViaKeys,
    isVideoPlaying,
    handleLoopThis3Second,
    handleShiftLoopSentence,
    threeSecondLoopState,
    setThreeSecondLoopState,
    isInReviewMode,
    handleLoopThisSentence,
    setContractThreeSecondLoopState,
    loopTranscriptState,
    handleUpdateLoopedSentence,
    handleBreakdownMasterSentence,
    handleAddMasterToReview,
    handleIsEasyReviewShortCut,
    handleBulkReviews,
    handleJumpToFirstElInReviewTranscript,
    handleQuickSaveSnippet,
    handleToggleSlowAudio,
  } = useLearningScreen();

  const handleShiftSnippet = (shiftNumber: number) => {
    if (isNumber(threeSecondLoopState) && threeSecondLoopState > 0) {
      // factor in small descrepancy
      const newCurrentNumber = threeSecondLoopState + shiftNumber;
      setThreeSecondLoopState(newCurrentNumber);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shiftKey = e.shiftKey;

      if (
        shiftKey &&
        e.key.toLowerCase() === 'arrowdown' &&
        !threeSecondLoopState &&
        (loopTranscriptState?.length === 0 || !loopTranscriptState)
      ) {
        handleLoopThisSentence();
        return;
      }

      if (isInReviewMode && e.key.toLowerCase() === '[') {
        handleJumpToFirstElInReviewTranscript();
        return;
      }
      if (isInReviewMode && e.key.toLowerCase() === ']') {
        handleJumpToFirstElInReviewTranscript(true);
        return;
      }

      if (shiftKey && isInReviewMode && e.key.toLowerCase() === ')') {
        // 0 shifted
        handleIsEasyReviewShortCut();
        return;
      }
      if (threeSecondLoopState || loopTranscriptState) {
        if (e.key.toLowerCase() === 'o') {
          if (!e.repeat) {
            handleToggleSlowAudio();
          }
          return;
        }
        // think of properties and array things
        if (
          threeSecondLoopState &&
          (!loopTranscriptState || loopTranscriptState?.length === 0)
        ) {
          if (shiftKey && e.key.toLowerCase() === '"') {
            handleLoopThis3Second();
            return;
          }
          if (e.key.toLowerCase() === 'arrowright') {
            handleShiftSnippet(0.5);
            return;
          }
          if (e.key.toLowerCase() === 'arrowleft') {
            handleShiftSnippet(-0.5);
            return;
          }

          if (e.key.toLowerCase() === 'arrowup') {
            setContractThreeSecondLoopState((prev) => !prev);
            return;
          }
          if (e.key.toLowerCase() === 'arrowdown') {
            // setContractThreeSecondLoopState(true);
            return;
          }
          // SHIFT + B // not sure if i need this or just remove the ultimate return
          if (e.shiftKey && e.key.toLowerCase() === 'p') {
            handleAddMasterToReview();
            return;
          }

          // SHIFT + B // not sure if i need this or just remove the ultimate return
          if (e.shiftKey && e.key.toLowerCase() === 'b') {
            handleBreakdownMasterSentence();
            return;
          }

          return;
        }

        if (shiftKey && loopTranscriptState && !threeSecondLoopState) {
          if (e.key.toLowerCase() === 'arrowdown') {
            handleUpdateLoopedSentence(true);
            return;
          } else if (e.key.toLowerCase() === 'arrowup') {
            handleUpdateLoopedSentence(false);
            return;
          } else if (e.key.toLowerCase() === 'arrowright') {
            handleShiftLoopSentence(true);
            return;
          }
          //  else if (e.key.toLowerCase() === 'enter') {
          //   handleBulkReviews();
          // }
        }
      }

      if (shiftKey && e.key.toLowerCase() === '|') {
        handleQuickSaveSnippet();
        return;
      }

      // SHIFT + B
      if (e.shiftKey && e.key.toLowerCase() === 'p') {
        handleAddMasterToReview();
        return;
      }

      // SHIFT + B
      if (e.shiftKey && e.key.toLowerCase() === 'b') {
        handleBreakdownMasterSentence();
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
          handleRewind();
          break;
        case 'l':
          handleRewind();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleJumpToSentenceViaKeys,
    handleBreakdownMasterSentence,
    handleRewind,
    handleLoopThisSentence,
    handleLoopThis3Second,
    threeSecondLoopState,
    handleShiftSnippet,
    handleToggleSlowAudio,
    loopTranscriptState,
    handleAddMasterToReview,
    handleUpdateLoopedSentence,
    handleShiftLoopSentence,
    isInReviewMode,
    handleIsEasyReviewShortCut,
    setContractThreeSecondLoopState,
    handleBulkReviews,
    handleJumpToFirstElInReviewTranscript,
    handleQuickSaveSnippet,
  ]);

  return null;
};

export default LearningScreenKeyListener;
