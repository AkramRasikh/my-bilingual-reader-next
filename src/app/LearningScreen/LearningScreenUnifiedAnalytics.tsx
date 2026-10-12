import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { useMemo, useState } from 'react';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import clsx from 'clsx';

function formatCheckpointTime(seconds: number) {
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

const LearningScreenUnifiedAnalytics = () => {
  const [isLoadingBulkState, setIsLoadingBulkState] = useState(false);
  const {
    sentenceRepsState,
    overlappedSentencesViableForReviewMemoized,
    handleAddOverlappedSnippetsToReview,
    wordRepsState,
    snippetRepsState,
    elapsed,
    formattedTranscriptState,
  } = useLearningScreen();

  const handleBulkAddToReviews = async () => {
    if (
      !overlappedSentencesViableForReviewMemoized ||
      overlappedSentencesViableForReviewMemoized?.length === 0
    ) {
      return;
    }

    try {
      setIsLoadingBulkState(true);
      await handleAddOverlappedSnippetsToReview();
    } finally {
      setIsLoadingBulkState(false);
    }
  };

  const bulkReviewCount = overlappedSentencesViableForReviewMemoized?.length ?? 0;

  const totalRepsPerMinState = useMemo(() => {
    if (elapsed <= 0) {
      return null;
    }

    const totalReps = sentenceRepsState + wordRepsState + snippetRepsState;
    return ((totalReps / elapsed) * 60).toFixed(1);
  }, [elapsed, sentenceRepsState, snippetRepsState, wordRepsState]);

  const checkpointTimeLabel = useMemo(() => {
    const lastReviewed = [...formattedTranscriptState]
      .reverse()
      .find((item) => item?.reviewData?.due);
    if (lastReviewed == null || !Number.isFinite(lastReviewed.time)) {
      return null;
    }
    return formatCheckpointTime(lastReviewed.time);
  }, [formattedTranscriptState]);

  return (
    <div className='flex flex-col items-center gap-3'>
      {checkpointTimeLabel && (
        <p
          className='text-center text-xs tabular-nums text-muted-foreground'
          data-testid='checkpoint-timestamp'
        >
          🚩 {checkpointTimeLabel}
        </p>
      )}
      <span
        className={clsx('relative', isLoadingBulkState ? 'opacity-50' : '')}
      >
        {isLoadingBulkState && (
          <span className='absolute right-4/10 top-1/8'>
            <LoadingSpinner />
          </span>
        )}
        <Button
          className='h-5 w-auto px-1 text-xs leading-none'
          data-testid='bulk-review-button'
          variant='ghost'
          onDoubleClick={handleBulkAddToReviews}
          disabled={isLoadingBulkState || bulkReviewCount === 0}
        >
          💰 {bulkReviewCount}
        </Button>
      </span>
      <p className='w-36 overflow-hidden text-center text-xs font-medium whitespace-nowrap tabular-nums text-muted-foreground'>
        Total/Min: {totalRepsPerMinState ?? '0.0'}
      </p>
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
