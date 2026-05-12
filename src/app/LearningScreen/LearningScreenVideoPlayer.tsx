'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import LearningScreenThreeSecondLoopEl from './LearningScreenThreeSecondLoopEl';
import useLearningScreen from './useLearningScreen';
import { LanguageEnum } from '../languages';
import {
  Loader2,
  Maximize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';

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
    currentTime,
    mediaDuration,
  } = useLearningScreen();

  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextFocusLoopState, setHighlightedTextFocusLoopState] =
    useState('');
  const [showWordDetailsState, setShowWordDetailsState] = useState(false);
  const [muted, setMuted] = useState(false);
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
                languageSelectedState={languageSelectedState}
              />
            </div>
          </div>
        ) : showMasterPlayComprehensiveTargetLangForOverlayState &&
          masterPlayComprehensiveTargetLangForOverlay.length > 0 ? (
          <div className='absolute top-0 left-0 w-full rounded-t-lg px-4 py-2 text-white'>
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
          <div className='absolute top-0 left-0 w-full rounded-t-lg px-4 py-2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
            <Button
              size='icon'
              variant='ghost'
              className='my-auto h-8 w-8 rounded-full bg-transparent'
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
          <div className='absolute bottom-12 left-1/2 w-fit max-w-[66.666%] -translate-x-1/2 rounded-md border border-white/20 bg-black/80 px-4 py-1.5'>
            <p className='text-center text-xs font-bold break-words text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'>
              {showWordDetailsState && compactWordDetailsText
                ? compactWordDetailsText
                : firstWordDefinitionInReview}
            </p>
          </div>
        ) : null}
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
