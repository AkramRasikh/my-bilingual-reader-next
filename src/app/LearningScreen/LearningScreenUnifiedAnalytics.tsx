import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { useMemo, useState } from 'react';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import clsx from 'clsx';

const LearningScreenUnifiedAnalytics = () => {
  const [isLoadingBulkState, setIsLoadingBulkState] = useState(false);
  const {
    sentenceRepsState,
    overlappedSentencesViableForReviewMemoized,
    handleAddOverlappedSnippetsToReview,
    wordRepsState,
    snippetRepsState,
    elapsed,
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

  return (
    <div className='flex flex-col items-center gap-3'>
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
      {totalRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit text-muted-foreground'>
          Total/Min: {totalRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
