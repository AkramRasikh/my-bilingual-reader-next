'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import {
  getCurrentTimeRangePhase,
  getSentenceTimeRange,
  getSnippetTimeRange,
  type ReviewTimeRangePhase,
} from './learning-screen-review-time-range';

const TIME_RANGE_PHASE_STYLES: Record<
  ReviewTimeRangePhase,
  {
    borderClassName: string;
    indicatorClassName: string;
    label: string;
    testId: string;
  }
> = {
  before: {
    borderClassName: 'border-4 border-red-500',
    indicatorClassName:
      'size-4 rounded-full border-4 border-red-500 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]',
    label: "Playback is before this clip's range",
    testId: 'learning-screen-review-before-time-range',
  },
  during: {
    borderClassName: 'border-4 border-amber-500',
    indicatorClassName:
      'size-4 rounded-full border-4 border-amber-500 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]',
    label: "Playback is within this clip's range",
    testId: 'learning-screen-review-during-time-range',
  },
  beyond: {
    borderClassName: 'border-4 border-green-500',
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
}: {
  children: React.ReactNode;
  timeRangePhase?: ReviewTimeRangePhase | null;
  showTimeRangeSlot?: boolean;
}) {
  const textClassName =
    'text-xs font-bold break-words text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]';

  const containerBorderClassName =
    showTimeRangeSlot && timeRangePhase
      ? TIME_RANGE_PHASE_STYLES[timeRangePhase].borderClassName
      : 'border border-white/20';

  return (
    <div className='pointer-events-none absolute inset-0 flex flex-col justify-end pb-4'>
      <div
        className={`pointer-events-auto mx-auto w-fit max-w-[66.666%] rounded-md bg-black/80 px-4 py-1.5 ${containerBorderClassName}`}
      >
        {showTimeRangeSlot ? (
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
    mediaDuration,
    sentenceMapMemoized,
  } = useLearningScreen();

  const [showWordDetailsState, setShowWordDetailsState] = useState(false);
  const quickReviewToggleFiredRef = useRef(false);

  const firstSnippetInReview = useMemo(
    () => postSnippetsMemoized.find((snippet) => snippet.id === firstElIdInReview),
    [postSnippetsMemoized, firstElIdInReview],
  );

  const snippetFocusText =
    firstSnippetInReview?.focusedText ||
    firstSnippetInReview?.suggestedFocusText ||
    '';

  const isPlayingSnippetInReview =
    Boolean(firstSnippetInReview) &&
    isSavedLoopPlayingState === firstElIdInReview &&
    snippetFocusText.length > 0;

  const firstSentenceInReview = useMemo(
    () => postSentencesMemoized.find((sentence) => sentence.id === firstElIdInReview),
    [postSentencesMemoized, firstElIdInReview],
  );

  const sentenceTargetLang = firstSentenceInReview?.targetLang?.trim() || '';

  const isFirstSentenceInReview =
    Boolean(firstSentenceInReview) && sentenceTargetLang.length > 0;

  const sentenceMapEntry = firstElIdInReview
    ? sentenceMapMemoized[firstElIdInReview]
    : undefined;

  const snippetTimeRangePhase = useMemo(() => {
    if (!firstSnippetInReview) {
      return null;
    }
    const { startTime, endTime } = getSnippetTimeRange(firstSnippetInReview);
    return getCurrentTimeRangePhase(currentTime, startTime, endTime);
  }, [firstSnippetInReview, currentTime]);

  const sentenceTimeRangePhase = useMemo(() => {
    if (!sentenceMapEntry) {
      return null;
    }
    const { startTime, endTime } = getSentenceTimeRange(
      sentenceMapEntry,
      mediaDuration,
    );
    return getCurrentTimeRangePhase(currentTime, startTime, endTime);
  }, [sentenceMapEntry, mediaDuration, currentTime]);

  const compactWordDetailsText = [
    firstWordInReviewDisplay?.surfaceForm,
    firstWordInReviewDisplay?.phonetic,
    firstWordInReviewDisplay?.transliteration,
  ]
    .filter((item) => Boolean(item && item.trim()))
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

  if (isPlayingSnippetInReview) {
    return (
      <ReviewOverlayPanel
        timeRangePhase={snippetTimeRangePhase}
        showTimeRangeSlot
      >
        <span data-testid='learning-screen-review-snippet-focus-text'>
          {snippetFocusText}
        </span>
      </ReviewOverlayPanel>
    );
  }

  if (isFirstSentenceInReview) {
    return (
      <ReviewOverlayPanel
        timeRangePhase={sentenceTimeRangePhase}
        showTimeRangeSlot
      >
        <span data-testid='learning-screen-review-sentence-target-lang'>
          {sentenceTargetLang}
        </span>
      </ReviewOverlayPanel>
    );
  }

  if (!showWordOverlay) {
    return null;
  }

  return (
    <ReviewOverlayPanel>
      <span data-testid='learning-screen-review-word-text'>
        {showWordDetailsState && compactWordDetailsText
          ? compactWordDetailsText
          : firstWordDefinitionInReview}
      </span>
    </ReviewOverlayPanel>
  );
};

export default LearningScreenReviewContentOnScreen;
