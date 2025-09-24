'use client';

import { useEffect } from 'react';
import useLearningScreen from './LearningScreen/useLearningScreen';

const qRewindTime = 3;

type Props = {
  isVideoPlaying: boolean;
};

const KeyListener = ({
  isVideoPlaying,
  handleJumpToSentenceViaKeys,
  handleBreakdownMasterSentence,
  handleAddMasterToReview,
  setIsPressDownShiftState,
  handleLoopThisSentence,
  handleLoopThis3Second,
  threeSecondLoopState,
  handleShiftSnippet,
  handleSlowDownAudio,
  loopTranscriptState,
  handleUpdateLoopedSentence,
  handleShiftLoopSentence,
  isInReviewMode,
  handleIsEasyReviewShortCut,
  setContractThreeSecondLoopState,
}: Props) => {
  const { handlePausePlay, handleRewind } = useLearningScreen();

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsPressDownShiftState(false);
        return;
      }

      if (threeSecondLoopState || loopTranscriptState) {
        if (e.key.toLowerCase() === 'o') {
          handleSlowDownAudio(false);
          return;
        }
      }
    };
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

      if (shiftKey && isInReviewMode && e.key.toLowerCase() === ')') {
        // 0 shifted
        handleIsEasyReviewShortCut();
        return;
      }
      if (threeSecondLoopState || loopTranscriptState) {
        // think of properties and array things
        if (
          threeSecondLoopState &&
          (!loopTranscriptState || loopTranscriptState?.length === 0)
        ) {
          if (shiftKey && e.key.toLowerCase() === 'k') {
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
        if (shiftKey && loopTranscriptState && !threeSecondLoopState) {
          if (e.key.toLowerCase() === 'arrowdown') {
            handleUpdateLoopedSentence(true);
          } else if (e.key.toLowerCase() === 'arrowup') {
            handleUpdateLoopedSentence(false);
          } else if (e.key.toLowerCase() === 'arrowright') {
            handleShiftLoopSentence(true);
          }
        }
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

      if (e.shiftKey && e.key.toLowerCase() === ' ') {
        handlePausePlay();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'k') {
        handleLoopThis3Second();
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
    handlePausePlay,
    setIsPressDownShiftState,
    handleLoopThisSentence,
    handleLoopThis3Second,
    threeSecondLoopState,
    handleShiftSnippet,
    handleSlowDownAudio,
    loopTranscriptState,
    handleAddMasterToReview,
    handleUpdateLoopedSentence,
    handleShiftLoopSentence,
    isInReviewMode,
    handleIsEasyReviewShortCut,
    setContractThreeSecondLoopState,
  ]);

  return null;
};

export default KeyListener;
