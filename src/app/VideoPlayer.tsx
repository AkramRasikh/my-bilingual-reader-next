'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreenThreeSecondLoopEl from './LearningScreen/LearningScreenThreeSecondLoopEl';

const VideoPlayer = ({
  url,
  ref,
  handleTimeUpdate,
  onLoadedMetadata,
  setIsVideoPlaying,
  threeSecondLoopState,
  handleSaveSnippet,
  overlappingTextMemoized,
}) => {
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');

  const masterTextRef = useRef(null);

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

  const videoUrl = url;

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleSaveSnippetFlow = async () => {
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
        ref={ref}
        src={videoUrl}
        controls
        className='w-full rounded-lg shadow-lg m-auto'
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      >
        Your browser does not support the video tag.
      </video>

      {isLooping && (
        <div className='absolute top-0 left-0 text-white px-4 py-2 rounded-lg w-full'>
          <div className='text-center'>
            <LearningScreenThreeSecondLoopEl
              overlappingTextMemoized={overlappingTextMemoized}
              masterTextRef={masterTextRef}
              showSaveSnippetButton={Boolean(handleSaveSnippet)}
              isLoadingSaveSnippetState={isLoadingSaveSnippetState}
              highlightedTextFocusLoopState={highlightedTextFocusLoopState}
              onSaveSnippetClick={handleSaveSnippetFlow}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
