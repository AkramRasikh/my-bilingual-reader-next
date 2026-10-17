'use client';

import { useEffect, useRef } from 'react';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import SnippetReview from '@/components/custom/SnippetReview';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
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
  const { wordsState, languageSelectedState } = useFetchData();
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
        const quickReviewSnippetId = current.postSnippetsMemoized[0]?.id;
        const snippetControlsAreMounted =
          current.isInReviewMode &&
          quickReviewSnippetId != null &&
          quickReviewSnippetId === current.firstElIdInReview;
        if (current.isInReviewMode && !snippetControlsAreMounted) {
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

  const quickReviewSnippet =
    gradeTarget.kind === 'snippet' ? gradeTarget.item : null;

  return (
    <div className='hidden' aria-hidden data-testid='closed-panel-review-controls'>
      {quickReviewSnippet ? (
        <SnippetReview
          snippetData={quickReviewSnippet}
          handleLoopHere={(params) =>
            learningScreen.handleLoopReviewMode({
              ...params,
              snippetId: quickReviewSnippet.id,
            })
          }
          isVideoPlaying={learningScreen.isVideoPlaying}
          threeSecondLoopState={learningScreen.threeSecondLoopState}
          handleUpdateSnippetComprehensiveReview={async ({
            snippetData,
            isRemoveReview,
            isSnippetReview,
          }) => {
            await learningScreen.handleUpdateSnippet({
              snippetData,
              isRemoveReview,
              isSnippetReview,
            });
            if (isSnippetReview) {
              learningScreen.setThreeSecondLoopState(null);
              learningScreen.setContractThreeSecondLoopState(false);
            }
          }}
          isReadyForQuickReview
          handleBreakdownSentence={({ sentenceId }) =>
            learningScreen.handleBreakdownSentence({
              sentenceId,
              targetLang:
                learningScreen.sentenceMapMemoized[sentenceId]?.targetLang ||
                '',
            })
          }
          isBreakingDownSentenceArrState={
            learningScreen.isBreakingDownSentenceArrState
          }
          currentTime={learningScreen.currentTime}
          getSentenceDataOfOverlappingWordsDuringSave={(time, highlightedText) => {
            const out = learningScreen.getSentenceDataOfOverlappingWordsDuringSave(
              time,
              highlightedText,
            );
            return typeof out === 'string' ? out : null;
          }}
          selectedContentTitleState={learningScreen.selectedContentTitleState}
          sentenceMapMemoized={learningScreen.sentenceMapMemoized}
          languageSelectedState={languageSelectedState}
          wordsState={wordsState}
          handleSaveWord={learningScreen.handleSaveWord}
          handleDeleteWordDataProvider={
            learningScreen.handleDeleteWordDataProvider
          }
        />
      ) : null}
      {gradeTarget.kind === 'word' ? (
        <ReviewSRSToggles
          isVocab
          contentItem={gradeTarget.item}
          handleReviewFunc={handleReviewWord}
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
