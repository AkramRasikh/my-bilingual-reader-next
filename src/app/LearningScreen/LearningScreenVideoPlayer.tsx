'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import LearningScreenThreeSecondLoopEl from './LearningScreenThreeSecondLoopEl';
import useLearningScreen from './useLearningScreen';
import { LanguageEnum } from '../languages';

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
  } = useLearningScreen();

  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');

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

  return (
    <div className='flex flex-col relative'>
      <video
        ref={videoRef}
        src={url}
        controls
        className='w-full rounded-lg shadow-lg m-auto'
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
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
      ) : null}
    </div>
  );
};

export default LearningScreenVideoPlayer;
