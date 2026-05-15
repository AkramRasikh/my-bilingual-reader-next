'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import {
  getSentenceTimeRange,
  getSnippetTimeRange,
  isCurrentTimeBeyondRange,
} from './learning-screen-review-time-range';

function ReviewTimeRangeIndicator({ isBeyondRange }: { isBeyondRange: boolean }) {
  return (
    <span
      className='flex w-3 shrink-0 items-center justify-center self-center'
      aria-hidden={!isBeyondRange}
    >
      <span
        className={
          isBeyondRange
            ? 'size-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.9)]'
            : 'size-2 rounded-full bg-transparent'
        }
        title={isBeyondRange ? "Playback is past this clip's range" : undefined}
        aria-label={
          isBeyondRange ? "Playback is past this clip's range" : undefined
        }
        data-testid={
          isBeyondRange ? 'learning-screen-review-past-time-range' : undefined
        }
      />
    </span>
  );
}

function ReviewOverlayPanel({
  children,
  isBeyondTimeRange = false,
  showTimeRangeSlot = false,
}: {
  children: React.ReactNode;
  isBeyondTimeRange?: boolean;
  showTimeRangeSlot?: boolean;
}) {
  const textClassName =
    'text-xs font-bold break-words text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]';

  return (
    <div className='pointer-events-none absolute inset-0 flex flex-col justify-end pb-4'>
      <div className='pointer-events-auto mx-auto w-fit max-w-[66.666%] rounded-md border border-white/20 bg-black/80 px-4 py-1.5'>
        {showTimeRangeSlot ? (
          <div className='flex items-center gap-2'>
            <p className={`min-w-0 flex-1 text-center ${textClassName}`}>{children}</p>
            <ReviewTimeRangeIndicator isBeyondRange={isBeyondTimeRange} />
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

  const snippetBeyondTimeRange = useMemo(() => {
    if (!firstSnippetInReview) {
      return false;
    }
    const { endTime } = getSnippetTimeRange(firstSnippetInReview);
    return isCurrentTimeBeyondRange(currentTime, endTime);
  }, [firstSnippetInReview, currentTime]);

  const sentenceBeyondTimeRange = useMemo(() => {
    if (!sentenceMapEntry) {
      return false;
    }
    const { endTime } = getSentenceTimeRange(sentenceMapEntry, mediaDuration);
    return isCurrentTimeBeyondRange(currentTime, endTime);
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
        isBeyondTimeRange={snippetBeyondTimeRange}
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
        isBeyondTimeRange={sentenceBeyondTimeRange}
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
