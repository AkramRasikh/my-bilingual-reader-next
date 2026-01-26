import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { HistoryIcon, SaveAllIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import clsx from 'clsx';

const LearningScreenUnifiedAnalytics = ({ sentenceRepsPerMinState }) => {
  const [isLoadingBulkState, setIsLoadingBulkState] = useState(false);
  const {
    sentencesNeedReview,
    sentencesPendingOrDue,
    contentMetaWordMemoized,
    sentenceRepsState,
    setSentenceRepsState,
    contentSnippets,
    overlappedSentencesViableForReviewMemoized,
    handleAddOverlappedSnippetsToReview,
  } = useLearningScreen();

  const handleClearReps = () => {
    setSentenceRepsState(0);
  };

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

  const [numberOfDueSnippets, numberOfReviewDataSnippets] = useMemo(() => {
    if (contentSnippets.length === 0) {
      return [0, 0];
    }

    return [
      contentSnippets.filter((item) => isDueCheck(item, new Date())).length,
      contentSnippets.filter((item) => item?.reviewData).length,
    ];
  }, [contentSnippets]);

  return (
    <div>
      <p
        className='text-xs font-medium m-auto w-fit'
        data-testid='analytics-sentences-count'
      >
        Sentences: {sentencesNeedReview}/{sentencesPendingOrDue}
      </p>
      <p
        className='text-xs font-medium m-auto w-fit'
        data-testid='analytics-words-due'
      >
        Words Due: {contentMetaWordMemoized.length}
      </p>
      <p
        className='text-xs font-medium m-auto w-fit'
        data-testid='analytics-snippets-due'
      >
        Snippets Due: {numberOfDueSnippets}/{numberOfReviewDataSnippets}/
        {contentSnippets.length}
      </p>
      <hr className='my-1' />
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
            Bulk Review: {overlappedSentencesViableForReviewMemoized?.length}
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
      <div className='flex gap-2 text-xs font-medium  w-fit m-auto'>
        <span className='m-auto' data-testid='analytics-reps-count'>
          Reps: {sentenceRepsState}
        </span>
        {sentenceRepsState ? (
          <Button
            className='w-5 h-5'
            variant='destructive'
            onClick={handleClearReps}
          >
            <HistoryIcon />
          </Button>
        ) : null}
      </div>
      {sentenceRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {sentenceRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
