'use client';
// 
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import SnippetReview from '@/components/custom/SnippetReview';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import {
  getCurrentTimeRangePhase,
  getSentenceTimeRange,
  getTimeRangeProgress,
  type ReviewTimeRangePhase,
} from './learning-screen-review-time-range';

const TIME_RANGE_PHASE_STYLES: Record<
  ReviewTimeRangePhase,
  {
    indicatorClassName: string;
    label: string;
    testId: string;
  }
> = {
  before: {
    indicatorClassName:
      'size-4 rounded-full border-4 border-red-500 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]',
    label: "Playback is before this clip's range",
    testId: 'learning-screen-review-before-time-range',
  },
  during: {
    indicatorClassName:
      'size-4 rounded-full border-4 border-amber-500 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]',
    label: "Playback is within this clip's range",
    testId: 'learning-screen-review-during-time-range',
  },
  beyond: {
    indicatorClassName:
      'size-4 rounded-full border-4 border-green-500 bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.9)]',
    label: "Playback is past this clip's range",
    testId: 'learning-screen-review-past-time-range',
  },
};

function ReviewTimeRangeIndicator({
  phase,
}: {
  phase: ReviewTimeRangePhase | null;
}) {
  const indicator = phase ? TIME_RANGE_PHASE_STYLES[phase] : null;

  return (
    <span
      className='flex w-4 shrink-0 items-center justify-center self-center'
      aria-hidden={!indicator}
    >
      <span
        className={
          indicator?.indicatorClassName ?? 'size-2 rounded-full bg-transparent'
        }
        title={indicator?.label}
        aria-label={indicator?.label}
        data-testid={indicator?.testId}
      />
    </span>
  );
}

function ReviewOverlayPanel({
  children,
  timeRangePhase = null,
  showTimeRangeSlot = false,
  expanded = false,
  progress = null,
}: {
  children: React.ReactNode;
  timeRangePhase?: ReviewTimeRangePhase | null;
  showTimeRangeSlot?: boolean;
  expanded?: boolean;
  progress?: number | null;
}) {
  const textClassName =
    'text-sm font-medium break-words text-black';

  const containerBorderClassName = 'border border-zinc-400';

  const showProgress = progress != null && Number.isFinite(progress);
  const progressPercent = showProgress
    ? Math.min(100, Math.max(0, progress * 100))
    : 0;

  const containerClassName = expanded
    ? `pointer-events-auto mx-auto max-h-[50%] w-fit max-w-[calc(100%-1rem)] overflow-y-auto rounded-md bg-amber-50 px-3 py-1.5 text-foreground ${containerBorderClassName}`
    : `pointer-events-auto relative mx-auto w-fit max-w-[66.666%] overflow-hidden rounded-md bg-amber-50 px-4 py-1.5 text-black ${containerBorderClassName}`;

  return (
    <div className='pointer-events-none absolute inset-0 bottom-0 flex flex-col justify-end'>
      <div
        className={containerClassName}
        data-testid={
          expanded ? 'learning-screen-review-snippet-focus-text' : undefined
        }
      >
        {showProgress && (
          <div
            className='pointer-events-none absolute inset-x-0 top-0 h-1 bg-amber-200'
            data-testid='learning-screen-review-sentence-progress'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label='Sentence playback progress'
          >
            <div
              className='h-full bg-amber-600'
              data-testid='learning-screen-review-sentence-progress-fill'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {expanded ? (
          children
        ) : showTimeRangeSlot ? (
          <div className='flex items-center gap-2'>
            <p className={`min-w-0 flex-1 text-center ${textClassName}`}>{children}</p>
            <ReviewTimeRangeIndicator phase={timeRangePhase} />
          </div>
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

  const compactWordDetailsText = [
    surfaceForm,
    baseForm && baseForm !== surfaceForm ? baseForm : '',
    phoneticOnFormsLine,
  ]
    .filter(Boolean)
    .join(' - ');

  const showWordOverlay = Boolean(firstElIdInReview && firstWordDefinitionInReview);

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
        showTimeRangeSlot
        progress={sentenceProgress}
      >
        <span
          data-testid='learning-screen-review-sentence-target-lang'
          className='text-base'
        >
          {sentenceTargetLang}
        </span>
        {showSentenceEnglish && (
          <span
            data-testid='learning-screen-review-sentence-base-lang'
            className='mt-0.5 block text-xs leading-tight'
          >
            {sentenceBaseLang}
          </span>
        )}
      </ReviewOverlayPanel>
    );
  }

  if (!showWordOverlay) {
    return null;
  }

  return (
    <ReviewOverlayPanel>
      <span data-testid='learning-screen-review-word-text' className='block'>
        {firstWordDefinitionInReview}
      </span>
      {showWordDetailsState && compactWordDetailsText ? (
        <span
          data-testid='learning-screen-review-word-details'
          className='mt-0.5 block'
        >
          {compactWordDetailsText}
        </span>
      ) : null}
      {showWordDetailsState && transliteration ? (
        <span
          data-testid='learning-screen-review-word-transliteration'
          className='mt-0.5 block'
        >
          {transliteration}
        </span>
      ) : null}
    </ReviewOverlayPanel>
  );
};

export default LearningScreenReviewContentOnScreen;
