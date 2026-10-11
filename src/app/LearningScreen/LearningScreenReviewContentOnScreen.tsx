'use client';
// 
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { chinese } from '@/app/languages';
import SnippetReview from '@/components/custom/SnippetReview';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import {
  getCurrentTimeRangePhase,
  getSentenceTimeRange,
  getTimeRangeProgress,
  type ReviewTimeRangePhase,
} from './learning-screen-review-time-range';
import ReviewSentenceOverlayText, {
  ColoredPhraseBreakdown,
} from './ReviewSentenceOverlayText';
import { findSavedWordBreakdown } from './find-breakdown-pieces-for-phrase';

const WORD_OVERLAY_LINE_CLASS =
  'mx-auto block w-fit max-w-full rounded-sm bg-amber-50 px-1.5 py-0.5 text-center leading-tight shadow-[0_1px_3px_rgba(0,0,0,0.45)]';

const CLOSED_WORD_DEFINITION_LENGTH = 60;

function closedWordDefinition(definition: string) {
  if (definition.length <= CLOSED_WORD_DEFINITION_LENGTH) {
    return definition;
  }
  return `${definition.slice(0, CLOSED_WORD_DEFINITION_LENGTH).trimEnd()}…`;
}

function ReviewOverlayPanel({
  children,
  timeRangePhase = null,
  expanded = false,
  progress = null,
  anchor = 'bottom',
  plain = false,
}: {
  children: React.ReactNode;
  timeRangePhase?: ReviewTimeRangePhase | null;
  expanded?: boolean;
  progress?: number | null;
  anchor?: 'top' | 'bottom';
  plain?: boolean;
}) {
  const textClassName = plain
    ? 'text-sm font-medium leading-tight break-words text-black'
    : 'text-sm font-medium break-words text-black';

  const containerBorderClassName = 'border border-zinc-400';

  const showProgress = progress != null && Number.isFinite(progress);
  const progressPercent = showProgress
    ? Math.min(100, Math.max(0, progress * 100))
    : 0;

  const containerClassName = expanded
    ? `pointer-events-auto mx-auto max-h-[50%] w-fit max-w-[calc(100%-1rem)] overflow-y-auto rounded-md bg-amber-50 px-3 py-1.5 text-foreground ${containerBorderClassName}`
    : plain
      ? 'pointer-events-auto relative mx-auto w-fit max-w-[66.666%] px-1 py-0.5 text-black'
      : `pointer-events-auto relative mx-auto w-fit max-w-[66.666%] overflow-hidden rounded-md bg-amber-50 px-4 py-1.5 text-black ${containerBorderClassName}`;

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col ${anchor === 'top' ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={containerClassName}
        data-testid={
          expanded ? 'learning-screen-review-snippet-focus-text' : undefined
        }
      >
        {showProgress && (
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${timeRangePhase === 'beyond' ? 'bg-green-200' : 'bg-amber-200'}`}
            data-testid='learning-screen-review-sentence-progress'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label='Sentence playback progress'
          >
            <div
              className={`h-full ${timeRangePhase === 'beyond' ? 'bg-green-500' : 'bg-amber-600'}`}
              data-testid='learning-screen-review-sentence-progress-fill'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {expanded ? (
          children
        ) : (
          <p className={`text-center ${textClassName}`}>{children}</p>
        )}
      </div>
    </div>
  );
}

const LearningScreenReviewContentOnScreen = () => {
  const {
    firstElIdInReview,
    firstWordDefinitionInReview,
    firstWordInReviewDisplay,
    postSnippetsMemoized,
    postSentencesMemoized,
    isSavedLoopPlayingState,
    currentTime,
    ref,
    mediaDuration,
    sentenceMapMemoized,
    threeSecondLoopState,
    isVideoPlaying,
    handleUpdateSnippet,
    isBreakingDownSentenceArrState,
    handleBreakdownSentence,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handleLoopReviewMode,
    isInReviewMode,
    onlyShowEngState,
  } = useLearningScreen();
  const { languageSelectedState, wordsState } = useFetchData();

  const [showWordDetailsState, setShowWordDetailsState] = useState(false);
  const [liveTime, setLiveTime] = useState(currentTime);
  const quickReviewToggleFiredRef = useRef(false);

  const playingReviewedSnippet = useMemo(() => {
    if (!isInReviewMode || !isSavedLoopPlayingState) {
      return undefined;
    }
    return postSnippetsMemoized.find(
      (snippet) => snippet.id === isSavedLoopPlayingState,
    );
  }, [isInReviewMode, isSavedLoopPlayingState, postSnippetsMemoized]);

  const firstSentenceInReview = useMemo(
    () => postSentencesMemoized.find((sentence) => sentence.id === firstElIdInReview),
    [postSentencesMemoized, firstElIdInReview],
  );

  const sentenceTargetLang = firstSentenceInReview?.targetLang?.trim() || '';
  const sentenceBaseLang = firstSentenceInReview?.baseLang?.trim() || '';
  const showSentenceEnglish = !onlyShowEngState && sentenceBaseLang.length > 0;

  const isFirstSentenceInReview =
    Boolean(firstSentenceInReview) && sentenceTargetLang.length > 0;
  const showSentenceOverlay =
    isFirstSentenceInReview && !playingReviewedSnippet;

  const sentenceMapEntry = firstElIdInReview
    ? sentenceMapMemoized[firstElIdInReview]
    : undefined;

  useEffect(() => {
    if (!isVideoPlaying || !showSentenceOverlay) return;

    let frame = 0;
    const tick = () => {
      const time = ref.current?.currentTime;
      if (typeof time === 'number' && Number.isFinite(time)) {
        setLiveTime(time);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVideoPlaying, showSentenceOverlay, ref]);

  const sentencePlayhead =
    isVideoPlaying && showSentenceOverlay ? liveTime : currentTime;

  const sentenceTimeRange = useMemo(() => {
    if (!sentenceMapEntry) {
      return null;
    }
    return getSentenceTimeRange(sentenceMapEntry, mediaDuration);
  }, [sentenceMapEntry, mediaDuration]);

  const sentenceTimeRangePhase = useMemo(() => {
    if (!sentenceTimeRange) {
      return null;
    }
    return getCurrentTimeRangePhase(
      sentencePlayhead,
      sentenceTimeRange.startTime,
      sentenceTimeRange.endTime,
    );
  }, [sentenceTimeRange, sentencePlayhead]);

  const sentenceProgress = useMemo(() => {
    if (!sentenceTimeRange) {
      return 0;
    }
    return getTimeRangeProgress(
      sentencePlayhead,
      sentenceTimeRange.startTime,
      sentenceTimeRange.endTime,
    );
  }, [sentenceTimeRange, sentencePlayhead]);

  const phonetic = firstWordInReviewDisplay?.phonetic?.trim() ?? '';
  const transliteration = firstWordInReviewDisplay?.transliteration?.trim() ?? '';
  const surfaceForm = firstWordInReviewDisplay?.surfaceForm?.trim() ?? '';
  const baseForm = firstWordInReviewDisplay?.baseForm?.trim() ?? '';
  const phoneticOnFormsLine =
    phonetic && phonetic !== transliteration ? phonetic : '';

  const showWordOverlay = Boolean(firstElIdInReview && firstWordDefinitionInReview);

  const wordPhrasePieces = useMemo(() => {
    const surfaceForm = firstWordInReviewDisplay?.surfaceForm;
    if (!surfaceForm) {
      return null;
    }
    const contextId = firstWordInReviewDisplay?.contextId;
    const contextSentence = contextId
      ? sentenceMapMemoized[contextId]
      : undefined;
    return findSavedWordBreakdown(
      surfaceForm,
      Object.values(sentenceMapMemoized),
      contextSentence,
    );
  }, [firstWordInReviewDisplay, sentenceMapMemoized]);

  const breakdownShowsReading =
    Boolean(wordPhrasePieces) && languageSelectedState === chinese;

  const shownWordForms = new Set<string>();
  if (wordPhrasePieces?.length) {
    shownWordForms.add(wordPhrasePieces.map((piece) => piece.surfaceForm).join(''));
    shownWordForms.add(
      wordPhrasePieces.map((piece) => piece.surfaceForm).join(' '),
    );
  }
  const compactWordDetailsText = [surfaceForm, baseForm, phoneticOnFormsLine]
    .filter((part) => {
      if (!part || shownWordForms.has(part)) {
        return false;
      }
      shownWordForms.add(part);
      return true;
    })
    .join(' - ');

  useEffect(() => {
    setShowWordDetailsState(false);
  }, [firstElIdInReview]);

  useEffect(() => {
    if (!firstWordInReviewDisplay) return;

    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);

      if (!gamepad) {
        return;
      }

      const map = getButtonMap(gamepad);
      const aPressed = gamepad.buttons[map.A_BTN]?.pressed;
      const rPressed = gamepad.buttons[map.R1_BTN]?.pressed;

      if (aPressed && rPressed && !quickReviewToggleFiredRef.current) {
        setShowWordDetailsState((prev) => !prev);
        quickReviewToggleFiredRef.current = true;
        return;
      }

      if (!aPressed || !rPressed) {
        quickReviewToggleFiredRef.current = false;
      }
    };

    const intervalId = setInterval(handleGamepadPress, 100);
    return () => clearInterval(intervalId);
  }, [firstWordInReviewDisplay]);

  if (playingReviewedSnippet) {
    return (
      <ReviewOverlayPanel expanded>
        <SnippetReview
          variant='overlay'
          snippetData={playingReviewedSnippet}
          handleLoopHere={(params) =>
            handleLoopReviewMode({
              ...params,
              snippetId: playingReviewedSnippet.id,
            })
          }
          isVideoPlaying={isVideoPlaying}
          threeSecondLoopState={threeSecondLoopState}
          handleUpdateSnippetComprehensiveReview={async ({
            snippetData,
            isRemoveReview,
            isSnippetReview,
          }) => {
            await handleUpdateSnippet({
              snippetData,
              isRemoveReview,
              isSnippetReview,
            });
            setThreeSecondLoopState(null);
            setContractThreeSecondLoopState(false);
          }}
          isReadyForQuickReview={
            firstElIdInReview === playingReviewedSnippet.id
          }
          handleBreakdownSentence={({ sentenceId }) =>
            handleBreakdownSentence({
              sentenceId,
              targetLang: sentenceMapMemoized[sentenceId]?.targetLang || '',
            })
          }
          isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
          currentTime={currentTime}
          getSentenceDataOfOverlappingWordsDuringSave={(time, highlightedText) => {
            const out = getSentenceDataOfOverlappingWordsDuringSave(
              time,
              highlightedText,
            );
            return typeof out === 'string' ? out : null;
          }}
          selectedContentTitleState={selectedContentTitleState}
          sentenceMapMemoized={sentenceMapMemoized}
          languageSelectedState={languageSelectedState}
          wordsState={wordsState}
          handleSaveWord={handleSaveWord}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
        />
      </ReviewOverlayPanel>
    );
  }

  if (isFirstSentenceInReview) {
    return (
      <ReviewOverlayPanel
        timeRangePhase={sentenceTimeRangePhase}
        progress={sentenceProgress}
      >
        <ReviewSentenceOverlayText
          targetLang={sentenceTargetLang}
          baseLang={sentenceBaseLang}
          showEnglish={showSentenceEnglish}
          vocab={firstSentenceInReview?.vocab}
          sentenceStructure={firstSentenceInReview?.sentenceStructure}
          languageSelectedState={languageSelectedState}
        />
      </ReviewOverlayPanel>
    );
  }

  if (!showWordOverlay) {
    return null;
  }

  return (
    <ReviewOverlayPanel anchor='top' plain>
      <span
        data-testid='learning-screen-review-word-text'
        className={WORD_OVERLAY_LINE_CLASS}
      >
        {showWordDetailsState
          ? firstWordDefinitionInReview
          : closedWordDefinition(firstWordDefinitionInReview ?? '')}
      </span>
      {showWordDetailsState && wordPhrasePieces ? (
        <ColoredPhraseBreakdown
          pieces={wordPhrasePieces}
          languageSelectedState={languageSelectedState}
          testId='learning-screen-review-word-breakdown'
          pinyinTestId='learning-screen-review-word-breakdown-pinyin'
          withTopMargin
          chip
        />
      ) : null}
      {showWordDetailsState && compactWordDetailsText ? (
        <span
          data-testid='learning-screen-review-word-details'
          className={`${WORD_OVERLAY_LINE_CLASS} mt-0.5`}
        >
          {compactWordDetailsText}
        </span>
      ) : null}
      {showWordDetailsState && transliteration && !breakdownShowsReading ? (
        <span
          data-testid='learning-screen-review-word-transliteration'
          className={`${WORD_OVERLAY_LINE_CLASS} mt-0.5`}
        >
          {transliteration}
        </span>
      ) : null}
    </ReviewOverlayPanel>
  );
};

export default LearningScreenReviewContentOnScreen;
