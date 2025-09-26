import clsx from 'clsx';
import LoadingSpinner from '@/app/LoadingSpinner';
import { Repeat2 } from 'lucide-react';
import useTranscriptItem from './useTranscriptItem';

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
  } = useTranscriptItem();

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const isGenericallyDoingAsyncAction = isGenericItemLoadingState.includes(
    contentItem.id,
  );

  return (
    <div className='flex flex-col gap-1 h-fit'>
      <button
        style={{
          padding: 5,
          borderRadius: 5,
          margin: 'auto 0',
          marginTop: 0,
        }}
        className={clsx(
          'bg-gray-300',
          thisSentenceIsPlaying && isVideoPlaying && 'bg-yellow-200',
        )}
        onClick={
          thisSentenceIsPlaying && isVideoPlaying
            ? handlePause
            : () => handleFromHere(thisTime)
        }
      >
        <span
          style={{
            height: 16,
          }}
        >
          {thisSentenceIsPlaying && isVideoPlaying ? '⏸️' : '▶️'}
        </span>
      </button>

      {hasSentenceBreakdown && (
        <button
          id='show-breakdown'
          onClick={() => {
            if (showSentenceBreakdownState) {
              closeBreakdown();
            } else {
              setBreakdownSentencesArrState((prev) => [
                ...prev,
                contentItem.id,
              ]);
            }
          }}
        >
          <span className='m-auto'>
            {showSentenceBreakdownState ? '❌' : '🧱'}
          </span>
        </button>
      )}
      {isSentenceLooping && (
        <button
          id='stop-loop'
          onClick={() => setLoopTranscriptState(null)}
          className='animate-spin'
        >
          <Repeat2 />
        </button>
      )}

      {(isGenericallyDoingAsyncAction || isLoadingState) && (
        <div className='m-auto'>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default TranscriptItemActionBar;
