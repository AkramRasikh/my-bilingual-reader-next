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

const TranscriptItemActionBar = () => {
  const {
    showSentenceBreakdownState,
    isLoadingState,
    contentItem,
    closeBreakdown,
    isSentenceLooping,
    masterPlay,
    isGenericItemLoadingState,
    setBreakdownSentencesArrState,
    setLoopTranscriptState,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    isBreakdownSentenceLoadingState,
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
    if (showSentenceBreakdownState) {
      closeBreakdown();
    } else {
      setBreakdownSentencesArrState((prev) => [...prev, contentItem.id]);
    }
  };

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
