'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import LearningScreenThreeSecondLoopEl from './LearningScreenThreeSecondLoopEl';
import useLearningScreen from './useLearningScreen';
import { LanguageEnum } from '../languages';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';

type LearningScreenVideoPlayerProps = {
  url: string;
  languageSelectedState: LanguageEnum;
};

const LearningScreenVideoPlayer = ({
  url,
  languageSelectedState,
}: LearningScreenVideoPlayerProps) => {
  const {
    ref,
    handleTimeUpdate,
    handleLoadedMetadata,
    setIsVideoPlaying,
    threeSecondLoopState,
    handleSaveSnippet,
    overlappingTextMemoized,
    masterPlayComprehensiveTargetLangForOverlay,
    showMasterPlayComprehensiveTargetLangForOverlayState,
    isSavedLoopPlayingState,
    isVideoPlaying,
    setThreeSecondLoopState,
    firstElIdInReview,
    firstWordDefinitionInReview,
    firstWordInReviewDisplay,
  } = useLearningScreen();

  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [showWordDetailsState, setShowWordDetailsState] = useState(false);
  const quickReviewToggleFiredRef = useRef(false);

  const masterTextRef = useRef<HTMLParagraphElement | null>(null);
  const videoRef = ref as React.RefObject<HTMLVideoElement | null>;

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !masterTextRef.current?.contains(anchorNode)) return;

      setHighlightedTextFocusLoopState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [setIsVideoPlaying, videoRef]);

  const handleSaveSnippetFlow = async () => {
    if (!handleSaveSnippet || !overlappingTextMemoized) return;

    try {
      setIsLoadingSaveSnippetState(true);
      await handleSaveSnippet({
        ...overlappingTextMemoized,
        focusedText: highlightedTextFocusLoopState,
      });
    } finally {
      setHighlightedTextFocusLoopState('');
      setIsLoadingSaveSnippetState(false);
    }
  };

  const isLooping = Boolean(threeSecondLoopState);
  const isLoopingSaved = isLooping && isSavedLoopPlayingState;
  const compactWordDetailsText = [
    firstWordInReviewDisplay?.surfaceForm,
    firstWordInReviewDisplay?.phonetic,
    firstWordInReviewDisplay?.transliteration,
  ]
    .filter((item) => Boolean(item && item.trim()))
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

  return (
    <div className='flex flex-col relative'>
      <video
        ref={videoRef}
        src={url}
        controls
        className='w-full rounded-lg shadow-lg m-auto'
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {isLooping && !isSavedLoopPlayingState ? (
        <div className='absolute top-0 left-0 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] px-4 py-2 rounded-lg w-full'>
          <div className='text-center'>
            <LearningScreenThreeSecondLoopEl
              overlappingTextMemoized={overlappingTextMemoized}
              masterTextRef={masterTextRef}
              showSaveSnippetButton={Boolean(handleSaveSnippet)}
              isLoadingSaveSnippetState={isLoadingSaveSnippetState}
              highlightedTextFocusLoopState={highlightedTextFocusLoopState}
              onSaveSnippetClick={handleSaveSnippetFlow}
              languageSelectedState={languageSelectedState}
            />
          </div>
        </div>
      ) : showMasterPlayComprehensiveTargetLangForOverlayState &&
        masterPlayComprehensiveTargetLangForOverlay.length > 0 ? (
        <div className='absolute top-0 left-0 text-white px-4 py-2 rounded-lg w-full'>
          {masterPlayComprehensiveTargetLangForOverlay.map((s) => {
            const isCurrent = s.position === 'current';
            return (
              <p
                key={`${s.position}-${s.id}`}
                className={clsx(
                  'text-center transition-all duration-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]',
                  !isCurrent ? 'text-gray-400 text-xs' : 'text-white text-sm',
                )}
              >
                {s.targetLang}
              </p>
            );
          })}
        </div>
      ) : isLoopingSaved ? (
        <div className='absolute top-0 left-0 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] px-4 py-2 rounded-lg w-full'>
          <Button
            size='icon'
            variant='ghost'
            className='rounded-full h-8 w-8 my-auto bg-transparent'
            onClick={() => setThreeSecondLoopState(null)}
          >
            <Loader2
              className={clsx(
                isVideoPlaying ? 'animate-spin' : '',
                'text-amber-600',
              )}
            />
          </Button>
        </div>
      ) : null}
      {firstElIdInReview && firstWordDefinitionInReview ? (
        <div className='absolute bottom-14 left-1/2 -translate-x-1/2 w-fit max-w-[66.666%] px-4 py-1.5 rounded-md bg-black/80 border border-white/20'>
          <p className='text-xs font-bold text-white text-center break-words drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
            {showWordDetailsState && compactWordDetailsText
              ? compactWordDetailsText
              : firstWordDefinitionInReview}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default LearningScreenVideoPlayer;
