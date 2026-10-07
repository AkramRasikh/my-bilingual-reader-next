import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { SaveAllIcon } from 'lucide-react';
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

  const totalRepsPerMinState = useMemo(() => {
    if (elapsed <= 0) {
      return null;
    }

    const totalReps = sentenceRepsState + wordRepsState + snippetRepsState;
    return ((totalReps / elapsed) * 60).toFixed(1);
  }, [elapsed, sentenceRepsState, snippetRepsState, wordRepsState]);

  return (
    <div>
      <div className='flex gap-2 text-xs font-medium w-fit m-auto py-2'>
        <span
          className={clsx('relative', isLoadingBulkState ? 'opacity-50' : '')}
        >
          {isLoadingBulkState && (
            <span className='absolute right-4/10 top-1/8'>
              <LoadingSpinner />
            </span>
          )}
          <span className='m-auto mr-2' data-testid='bulk-review-count'>
            Bulk Review: {overlappedSentencesViableForReviewMemoized?.length ?? 0}
          </span>

          <Button
            className='w-5 h-5 align-sub bg-amber-300 border-amber-300'
            data-testid='bulk-review-button'
            variant='outline'
            onDoubleClick={handleBulkAddToReviews}
            disabled={
              isLoadingBulkState ||
              !overlappedSentencesViableForReviewMemoized?.length ||
              overlappedSentencesViableForReviewMemoized?.length === 0
            }
          >
            <SaveAllIcon />
          </Button>
        </span>
      </div>
      {totalRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit text-muted-foreground'>
          Total/Min: {totalRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
