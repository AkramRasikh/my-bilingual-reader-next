'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreenLoopUI from './LearningScreen/LearningScreenLoopUI';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreen/LearningScreenLoopBtn';
import { Button } from '@/components/ui/button';
import { Loader2, SaveIcon } from 'lucide-react';

const VideoPlayer = ({
  url,
  ref,
  handleTimeUpdate,
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
    } catch (error) {
      console.log('## handleSaveSnippetFlow error', error);
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
      >
        Your browser does not support the video tag.
      </video>
      {threeSecondLoopState && <LearningScreenLoopUI />}{' '}
      <div
        className={clsx(
          threeSecondLoopState ? 'flex w-full justify-between gap-2' : '',
        )}
      >
        {overlappingTextMemoized ? (
          <p
            ref={masterTextRef}
            className={clsx(
              'text-center font-bold text-xl text-blue-700 backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg',
              threeSecondLoopState ? 'm-auto' : '',
            )}
          >
            {overlappingTextMemoized?.targetLang}
          </p>
        ) : null}
        {threeSecondLoopState && <LearningScreenLoopBtn />}
        {handleSaveSnippet && threeSecondLoopState && (
          <Button
            data-testid='save-snippet-button'
            size='icon'
            variant='outline'
            className={clsx(
              'rounded-full h-9 w-9 my-auto',
              isLoadingSaveSnippetState ? 'animate-pulse bg-amber-600' : '',
              highlightedTextFocusLoopState ? 'animate-in' : '',
            )}
            onClick={handleSaveSnippetFlow}
            disabled={
              !highlightedTextFocusLoopState || isLoadingSaveSnippetState
            }
          >
            {isLoadingSaveSnippetState ? <Loader2 /> : <SaveIcon />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
