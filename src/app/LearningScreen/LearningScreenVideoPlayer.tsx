'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import LearningScreenThreeSecondLoopEl from './LearningScreenThreeSecondLoopEl';
import LearningScreenReviewContentOnScreen from './LearningScreenReviewContentOnScreen';
import LearningScreenPlaybackCaptions from './LearningScreenPlaybackCaptions';
import LearningScreenOverlayWordRail from './LearningScreenOverlayWordRail';
import LearningScreenSnippetCoverageDot from './LearningScreenSnippetCoverageDot';
import useLearningScreen from './useLearningScreen';
import { LanguageEnum } from '../languages';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Maximize2,
  Pause,
  Play,
  Repeat2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { stepCaptionLift } from './captionLift';
function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const ss = s.toString().padStart(2, '0');
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${ss}`;
  }
  return `${m}:${ss}`;
}

type LearningScreenVideoPlayerProps = {
  url: string;
  languageSelectedState: LanguageEnum;
  isRightPanelOpen: boolean;
};

function CaptionLiftControl({
  percent,
  onChange,
}: {
  percent: number;
  onChange: (percent: number) => void;
}) {
  return (
    <div
      data-testid='caption-lift-control'
      className='pointer-events-auto absolute top-1/2 left-1 z-30 flex -translate-y-1/2 flex-col items-center rounded-full bg-black/55 py-0.5'
    >
      <Button
        type='button'
        size='icon'
        variant='ghost'
        className='size-6 text-white hover:bg-white/10'
        aria-label='Raise transcript'
        disabled={percent >= 100}
        onClick={() => onChange(stepCaptionLift(percent, 1))}
      >
        <ChevronUp className='size-3.5' />
      </Button>
      <span
        data-testid='caption-lift-percent'
        className='text-[10px] leading-none text-white tabular-nums drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]'
      >
        {percent}
      </span>
      <Button
        type='button'
        size='icon'
        variant='ghost'
        className='size-6 text-white hover:bg-white/10'
        aria-label='Lower transcript'
        disabled={percent <= 0}
        onClick={() => onChange(stepCaptionLift(percent, -1))}
      >
        <ChevronDown className='size-3.5' />
      </Button>
    </div>
  );
}

const LearningScreenVideoPlayer = ({
  url,
  languageSelectedState,
  isRightPanelOpen,
}: LearningScreenVideoPlayerProps) => {
  const {
    ref,
    handleTimeUpdate,
    handleLoadedMetadata,
    setIsVideoPlaying,
    threeSecondLoopState,
    handleSaveSnippet,
    overlappingTextMemoized,
    isSavedLoopPlayingState,
    isVideoPlaying,
    setThreeSecondLoopState,
    currentTime,
    mediaDuration,
    loopTranscriptState,
  } = useLearningScreen();

  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [muted, setMuted] = useState(false);
  const [captionLiftPercent, setCaptionLiftPercent] = useState(0);

  const masterTextRef = useRef<HTMLParagraphElement | null>(null);
  const videoRef = ref as React.RefObject<HTMLVideoElement | null>;

  useEffect(() => {
    const handleSelectionEnd = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !masterTextRef.current?.contains(anchorNode)) return;

      setHighlightedTextFocusLoopState(selectedText || '');
    };

    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);

    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd);
      document.removeEventListener('touchend', handleSelectionEnd);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    const syncMuted = () => setMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', syncMuted);
    setMuted(video.muted);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', syncMuted);
    };
  }, [setIsVideoPlaying, videoRef, url]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    const v = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    if (typeof v.webkitEnterFullscreen === 'function') {
      try {
        v.webkitEnterFullscreen();
        return;
      } catch {
        // fall through to standard fullscreen
      }
    }
    void video.requestFullscreen?.();
  };

  const handleSeek = (values: number[]) => {
    const next = values[0];
    const video = videoRef.current;
    if (!video || mediaDuration == null || !Number.isFinite(next)) return;
    video.currentTime = Math.min(Math.max(0, next), mediaDuration);
    handleTimeUpdate();
  };

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
  const sentenceLoopCount = loopTranscriptState?.length ?? 0;
  const durationForSlider = mediaDuration && mediaDuration > 0 ? mediaDuration : 1;
  const scrubberValue = Math.min(currentTime, durationForSlider);

  return (
    <div className='relative flex flex-col overflow-hidden rounded-lg shadow-lg'>
      <div className='relative w-full'>
        <video
          ref={videoRef}
          src={url}
          className='m-auto block w-full cursor-pointer'
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlayPause}
          playsInline
        >
          Your browser does not support the video tag.
        </video>

        {isLooping && !isSavedLoopPlayingState ? (
          <div className='absolute top-0 left-0 w-full rounded-t-lg px-4 py-2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
            <div className='text-center'>
              <LearningScreenThreeSecondLoopEl
                overlappingTextMemoized={overlappingTextMemoized}
                masterTextRef={masterTextRef}
                showSaveSnippetButton={Boolean(handleSaveSnippet)}
                isLoadingSaveSnippetState={isLoadingSaveSnippetState}
                highlightedTextFocusLoopState={highlightedTextFocusLoopState}
                onSaveSnippetClick={handleSaveSnippetFlow}
                saveFromGamepad={!isRightPanelOpen}
                onSaveFocusedText={async (focusedText) => {
                  if (!handleSaveSnippet || !overlappingTextMemoized) return;
                  setIsLoadingSaveSnippetState(true);
                  try {
                    await handleSaveSnippet({
                      ...overlappingTextMemoized,
                      focusedText,
                    });
                  } finally {
                    setIsLoadingSaveSnippetState(false);
                  }
                }}
                languageSelectedState={languageSelectedState}
              />
            </div>
          </div>
        ) : null}
        {isLoopingSaved || sentenceLoopCount > 0 ? (
          <div className='pointer-events-none absolute top-0 left-0 z-30 flex items-center gap-1 px-4 py-2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
            {isLoopingSaved ? (
              <Button
                size='icon'
                variant='ghost'
                className='pointer-events-auto my-auto h-8 w-8 rounded-full bg-transparent'
                onClick={() => setThreeSecondLoopState(null)}
              >
                <Loader2
                  className={clsx(
                    isVideoPlaying ? 'animate-spin' : '',
                    'text-amber-600',
                  )}
                />
              </Button>
            ) : null}
            {sentenceLoopCount > 0 ? (
              <div
                data-testid='learning-screen-sentence-loop-indicator'
                className={`flex items-center gap-0.5${isLoopingSaved ? '' : ' ml-[15px]'}`}
              >
                <Repeat2
                  className={clsx(
                    'size-3.5 shrink-0',
                    isVideoPlaying ? 'animate-spin' : '',
                  )}
                />
                <span
                  data-testid='learning-screen-sentence-loop-count'
                  className='text-[11px] font-semibold tabular-nums leading-none'
                >
                  {sentenceLoopCount}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
        <CaptionLiftControl
          percent={captionLiftPercent}
          onChange={setCaptionLiftPercent}
        />
        <LearningScreenReviewContentOnScreen
          captionLiftPercent={captionLiftPercent}
        />
        <LearningScreenPlaybackCaptions
          captionLiftPercent={captionLiftPercent}
        />
        <LearningScreenOverlayWordRail
          languageSelectedState={languageSelectedState}
        />
        <LearningScreenSnippetCoverageDot />
      </div>

      <div className='flex w-full min-w-0 items-center gap-2 border-t border-white/10 bg-zinc-950/95 px-2 py-1.5 text-white'>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='size-8 shrink-0 text-white hover:bg-white/10'
          onClick={togglePlayPause}
          aria-label={isVideoPlaying ? 'Pause' : 'Play'}
        >
          {isVideoPlaying ? (
            <Pause className='size-4' />
          ) : (
            <Play className='size-4' />
          )}
        </Button>
        <span className='shrink-0 tabular-nums text-[11px] text-zinc-300'>
          {formatPlaybackTime(currentTime)}
        </span>
        <Slider
          className='min-w-0 flex-1 py-2 [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-white'
          min={0}
          max={durationForSlider}
          step={0.05}
          value={[scrubberValue]}
          onValueChange={handleSeek}
          disabled={!mediaDuration}
          aria-label='Seek'
        />
        <span className='shrink-0 tabular-nums text-[11px] text-zinc-300'>
          {formatPlaybackTime(mediaDuration ?? 0)}
        </span>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='size-8 shrink-0 text-white hover:bg-white/10'
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <VolumeX className='size-4' />
          ) : (
            <Volume2 className='size-4' />
          )}
        </Button>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='size-8 shrink-0 text-white hover:bg-white/10'
          onClick={enterFullscreen}
          aria-label='Fullscreen'
        >
          <Maximize2 className='size-4' />
        </Button>
      </div>
    </div>
  );
};

export default LearningScreenVideoPlayer;
