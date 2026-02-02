import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import {
  LucideHammer,
  LucidePauseCircle,
  LucidePlayCircle,
  Repeat2,
} from 'lucide-react';
import useTranscriptItem from './useTranscriptItem';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const TranscriptItemActionBar = () => {
  const {
    showSentenceBreakdownState,
    isLoadingState,
    contentItem,
    isSentenceLooping,
    masterPlay,
    isGenericItemLoadingState,
    setLoopTranscriptState,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    isBreakdownSentenceLoadingState,
    setShowSentenceBreakdownState,
    isReadyForQuickReview,
  } = useTranscriptItem();

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const isGenericallyDoingAsyncAction = isGenericItemLoadingState.includes(
    contentItem.id,
  );

  const handlePlayActionBar = () =>
    thisSentenceIsPlaying && isVideoPlaying
      ? handlePause()
      : handleFromHere(thisTime);

  const handleBreakdownClick = () => {
    setShowSentenceBreakdownState(!showSentenceBreakdownState);
  };

  useEffect(() => {
    if (!isReadyForQuickReview) return;

    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad && gamepad.buttons[1]?.pressed) {
        handlePlayActionBar();
      }
    };

    const intervalId = setInterval(handleGamepadPress, 100);

    return () => clearInterval(intervalId);
  }, [isReadyForQuickReview, thisSentenceIsPlaying, isVideoPlaying, thisTime]);

  return (
    <div className='flex flex-col gap-1 h-fit'>
      <Button
        data-testid={`transcript-play-button-${contentItem.id}`}
        className={clsx(
          'bg-gray-300 h-7 w-7',
          thisSentenceIsPlaying && isVideoPlaying && 'bg-yellow-200',
        )}
        variant='ghost'
        onClick={handlePlayActionBar}
      >
        {thisSentenceIsPlaying && isVideoPlaying ? (
          <LucidePauseCircle />
        ) : (
          <LucidePlayCircle />
        )}
      </Button>

      {hasSentenceBreakdown ? (
        <button
          id='show-breakdown'
          data-testid={`transcript-breakdown-complete-${contentItem.id}`}
          onClick={handleBreakdownClick}
        >
          <span className='m-auto'>
            {showSentenceBreakdownState ? '❌' : '🧱'}
          </span>
        </button>
      ) : isBreakdownSentenceLoadingState ? (
        <div
          className='animate-pulse '
          data-testid={`transcript-breakdown-loading-${contentItem.id}`}
        >
          <LucideHammer
            color='brown'
            className='animate-bounce mx-auto fill-amber-700 rounded-4xl'
            size={16}
          />
        </div>
      ) : null}

      {isSentenceLooping && (
        <button
          id='stop-loop'
          data-testid={`stop-loop-${contentItem.id}`}
          onClick={() => {
            setLoopTranscriptState(null);
          }}
        >
          <div className={clsx(isVideoPlaying ? 'animate-spin' : '')}>
            <Repeat2 />
          </div>
        </button>
      )}

      {(isGenericallyDoingAsyncAction || isLoadingState) && (
        <div
          className='m-auto'
          data-testid={`transcript-action-loading-${contentItem.id}`}
        >
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default TranscriptItemActionBar;
