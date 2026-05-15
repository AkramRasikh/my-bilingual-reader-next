'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';

function ReviewOverlayPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className='pointer-events-none absolute inset-0 flex flex-col justify-end pb-4'>
      <div className='pointer-events-auto mx-auto w-fit max-w-[66.666%] rounded-md border border-white/20 bg-black/80 px-4 py-1.5'>
        <p className='text-center text-xs font-bold break-words text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
          {children}
        </p>
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
    masterPlay,
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

  const isPlayingSentenceInReview =
    Boolean(firstSentenceInReview) &&
    masterPlay === firstElIdInReview &&
    sentenceTargetLang.length > 0;

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
      <ReviewOverlayPanel>
        <span data-testid='learning-screen-review-snippet-focus-text'>
          {snippetFocusText}
        </span>
      </ReviewOverlayPanel>
    );
  }

  if (isPlayingSentenceInReview) {
    return (
      <ReviewOverlayPanel>
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
