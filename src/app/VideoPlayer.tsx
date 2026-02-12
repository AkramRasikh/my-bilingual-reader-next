'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreenLoopUI from './LearningScreen/LearningScreenLoopUI';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreen/LearningScreenLoopBtn';
import { Button } from '@/components/ui/button';
import { Loader2, SaveIcon } from 'lucide-react';
import VideoOverlay from './VideoOverlay';
import VideoOverlayAllWords from './VideoOverlayAllWords';
import { WordTypes } from './types/word-types';
import { SentenceMapItemTypes } from './types/content-types';

interface OverlappingTextMemoized {
  targetLang: string;
  baseLang?: string;
  suggestedFocusText?: string;
}

interface VideoPlayerProps {
  url: string;
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
  handleTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  setIsVideoPlaying: (playing: boolean) => void;
  threeSecondLoopState: number | null;
  handleSaveSnippet?: (
    data: OverlappingTextMemoized & { focusedText: string },
  ) => Promise<void>;
  overlappingTextMemoized: OverlappingTextMemoized | null;
  contentMetaWordMemoized?: WordTypes[];
  currentTime?: number;
  sentenceMapMemoized?: Record<string, SentenceMapItemTypes>;
}

const VideoPlayer = ({
  url,
  ref,
  handleTimeUpdate,
  onLoadedMetadata,
  setIsVideoPlaying,
  threeSecondLoopState,
  handleSaveSnippet,
  overlappingTextMemoized,
  contentMetaWordMemoized = [],
  currentTime = 0,
  sentenceMapMemoized = {},
}: VideoPlayerProps) => {
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [overlayMode, setOverlayMode] = useState<'saved-words' | 'all-words'>(
    'saved-words',
  );
  const [showTransliteration, setShowTransliteration] = useState(false);

  const masterTextRef = useRef<HTMLParagraphElement>(null);

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
  }, [ref, setIsVideoPlaying]);

  const handleSaveSnippetFlow = async () => {
    if (!handleSaveSnippet || !overlappingTextMemoized) return;

    try {
      setIsLoadingSaveSnippetState(true);
      await handleSaveSnippet({
        targetLang: overlappingTextMemoized.targetLang,
        baseLang: overlappingTextMemoized.baseLang,
        suggestedFocusText: overlappingTextMemoized.suggestedFocusText,
        focusedText: highlightedTextFocusLoopState,
      });
    } finally {
      setHighlightedTextFocusLoopState('');
      setIsLoadingSaveSnippetState(false);
    }
  };

  return (
    <div className='flex flex-col'>
      <div className='relative'>
        <video
          ref={ref as React.RefObject<HTMLVideoElement>}
          src={videoUrl}
          controls
          className='w-full rounded-lg shadow-lg m-auto'
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        >
          Your browser does not support the video tag.
        </video>
        {overlayMode === 'saved-words' ? (
          <VideoOverlay
            contentMetaWordMemoized={contentMetaWordMemoized}
            currentTime={currentTime}
            showTransliteration={showTransliteration}
            sentenceMapMemoized={sentenceMapMemoized}
          />
        ) : (
          <VideoOverlayAllWords
            currentTime={currentTime}
            sentenceMapMemoized={sentenceMapMemoized}
            contentMetaWordMemoized={contentMetaWordMemoized}
            showTransliteration={showTransliteration}
          />
        )}
      </div>
      <div className='flex items-center gap-4 px-2 py-1'>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='checkbox'
            checked={showTransliteration}
            onChange={(e) => setShowTransliteration(e.target.checked)}
            className='cursor-pointer'
          />
          <span>Show transliteration</span>
        </label>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='checkbox'
            checked={overlayMode === 'all-words'}
            onChange={(e) =>
              setOverlayMode(e.target.checked ? 'all-words' : 'saved-words')
            }
            className='cursor-pointer'
          />
          <span>Show all words</span>
        </label>
      </div>
      {threeSecondLoopState && <LearningScreenLoopUI />}{' '}
      <div
        className={clsx(
          threeSecondLoopState ? 'flex w-full justify-between gap-2' : '',
        )}
      >
        {overlappingTextMemoized ? (
          <p
            ref={masterTextRef}
            data-testid='video-player-snippet-text'
            className={clsx(
              'text-center font-bold text-xl backdrop-blur-xs backdrop-brightness-90 p-1 m-1 rounded-lg text-gray-700',
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
