'use client';

import { useEffect, useRef } from 'react';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { Snippet } from '@/app/types/content-types';
import {
  getButtonMap,
  isGamepadButtonHeld,
} from './experimental/gamepadButtonMap';
import useLearningScreen from './useLearningScreen';
import {
  closedPanelGradeTarget,
  playFirstReviewItem,
} from './closed-panel-review-play';

const LearningScreenClosedPanelReviewActions = ({
  isRightPanelOpen,
}: {
  isRightPanelOpen: boolean;
}) => {
  const learningScreen = useLearningScreen();
  const { wordsState } = useFetchData();
  const learningScreenRef = useRef(learningScreen);
  learningScreenRef.current = learningScreen;
  const bWasDownRef = useRef(false);

  useEffect(() => {
    if (isRightPanelOpen) {
      bWasDownRef.current = false;
      return;
    }

    const intervalId = window.setInterval(() => {
      const gamepads = navigator.getGamepads?.();
      const gamepad = gamepads
        ? Array.from(gamepads).find((pad) => pad != null)
        : null;

      if (!gamepad) {
        bWasDownRef.current = false;
        return;
      }

      const map = getButtonMap(gamepad);
      const bDown =
        Boolean(gamepad.buttons[map.B_BTN]?.pressed) &&
        !isGamepadButtonHeld(gamepad.buttons, map.L2_BTN) &&
        !isGamepadButtonHeld(gamepad.buttons, map.R1_BTN);

      if (bDown && !bWasDownRef.current) {
        const current = learningScreenRef.current;
        if (current.isInReviewMode) {
          playFirstReviewItem({
            snippets: current.postSnippetsMemoized,
            words: current.postWordsMemoized,
            sentences: current.postSentencesMemoized,
            contentSnippets: current.contentSnippets,
            isVideoPlaying: current.isVideoPlaying,
            masterPlay: current.masterPlay,
            handlePause: current.handlePause,
            handleFromHere: current.handleFromHere,
            handlePlayFromHere: current.handlePlayFromHere,
            playFromThisContext: current.playFromThisContext,
            handleLoopReviewMode: current.handleLoopReviewMode,
          });
        }
      }

      bWasDownRef.current = bDown;
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [isRightPanelOpen]);

  if (isRightPanelOpen || !learningScreen.isInReviewMode) {
    return null;
  }

  const gradeTarget = closedPanelGradeTarget({
    snippets: learningScreen.postSnippetsMemoized,
    words: learningScreen.postWordsMemoized,
    sentences: learningScreen.postSentencesMemoized,
    now: new Date(),
  });

  if (!gradeTarget) {
    return null;
  }

  const handleReviewWord = async (arg: {
    wordId: string;
    fieldToUpdate?: Parameters<
      typeof learningScreen.updateWordDataProvider
    >[0]['fieldToUpdate'];
    isRemoveReview?: boolean;
  }) => {
    await learningScreen.updateWordDataProvider({
      wordId: arg.wordId,
      fieldToUpdate: arg.fieldToUpdate ?? {},
      isRemoveReview: arg.isRemoveReview,
    });
  };

  const handleReviewSnippet = async (arg: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
  }) => {
    const savedWordsInSnippet = findAllInstancesOfWordsInSentence(
      arg.snippetData.focusedText || arg.snippetData.suggestedFocusText || '',
      wordsState,
    );
    await learningScreen.handleUpdateSnippet({
      snippetData: arg.snippetData,
      isRemoveReview:
        Boolean(arg.isRemoveReview) && savedWordsInSnippet.length === 0,
      isSnippetReview: true,
    });
  };

  return (
    <div className='hidden' aria-hidden>
      {gradeTarget.kind === 'word' ? (
        <ReviewSRSToggles
          isVocab
          contentItem={gradeTarget.item}
          handleReviewFunc={handleReviewWord}
          isReadyForQuickReview
        />
      ) : null}
      {gradeTarget.kind === 'snippet' ? (
        <ReviewSRSToggles
          isSnippet
          contentItem={gradeTarget.item}
          handleReviewFunc={handleReviewSnippet}
          isReadyForQuickReview
        />
      ) : null}
      {gradeTarget.kind === 'sentence' ? (
        <ReviewSRSToggles
          isVocab={false}
          contentItem={gradeTarget.item}
          handleReviewFunc={learningScreen.handleReviewFunc}
          isReadyForQuickReview
        />
      ) : null}
    </div>
  );
};

export default LearningScreenClosedPanelReviewActions;
