import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import {
  EllipsisVertical,
  LucidePauseCircle,
  LucidePlayCircle,
  Repeat2,
} from 'lucide-react';
import useTranscriptItem from './useTranscriptItem';
import { Button } from '@/components/ui/button';

const TranscriptItemInReviewMiniActionBar = () => {
  const {
    isLoadingState,
    contentItem,
    isSentenceLooping,
    masterPlay,
    isGenericItemLoadingState,
    setLoopTranscriptState,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    setOverrideMiniReviewState,
  } = useTranscriptItem();

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const isGenericallyDoingAsyncAction = isGenericItemLoadingState.includes(
    contentItem.id,
  );

  const handlePlayActionBar = () =>
    thisSentenceIsPlaying && isVideoPlaying
      ? handlePause()
      : handleFromHere(thisTime);

  return (
    <div
      className='opacity-50 flex flex-col gap-1 h-fit m-1'
      style={{
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      <Button
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

      <button
        id='see-more'
        className='m-auto'
        onClick={() => setOverrideMiniReviewState(true)}
      >
        <EllipsisVertical />
      </button>

      <button
        id='stop-loop'
        onClick={() => setLoopTranscriptState(null)}
        disabled={!isSentenceLooping}
        className={clsx(
          isVideoPlaying ? 'animate-spin' : '',
          'm-auto',
          isSentenceLooping ? 'block' : 'invisible',
        )}
      >
        <Repeat2 />
      </button>

      {(isGenericallyDoingAsyncAction || isLoadingState) && (
        <div className='m-auto'>
          <LoadingSpinner />
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TranscriptItemInReviewMiniActionBar;
