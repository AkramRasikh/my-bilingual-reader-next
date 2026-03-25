'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreenLoopUI from './LearningScreen/LearningScreenLoopUI';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreen/LearningScreenLoopBtn';
import { Button } from '@/components/ui/button';
import { Loader2, SaveIcon } from 'lucide-react';
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

  return (
    <div className='flex flex-col'>
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
      <div>

      <LearningScreenThreeSecondLoopEl 
        threeSecondLoopState={threeSecondLoopState}
        overlappingTextMemoized={overlappingTextMemoized}
        masterTextRef={masterTextRef}
        showSaveSnippetButton={Boolean(handleSaveSnippet)}
        isLoadingSaveSnippetState={isLoadingSaveSnippetState}
        highlightedTextFocusLoopState={highlightedTextFocusLoopState}
        onSaveSnippetClick={handleSaveSnippetFlow}
      />
        </div>
    </div>
  );
};

export default VideoPlayer;
