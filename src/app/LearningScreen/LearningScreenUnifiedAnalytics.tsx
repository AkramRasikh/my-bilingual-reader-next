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

  const overlappedSentencesViableForReviewMemoizedKeyArray =
    overlappedSentencesViableForReviewMemoized?.keyArray;

  const handleClearReps = () => {
    setSentenceRepsState(0);
  };

  const handleBulkAddToReviews = async () => {
    if (
      !overlappedSentencesViableForReviewMemoizedKeyArray ||
      overlappedSentencesViableForReviewMemoizedKeyArray?.length === 0
    ) {
      return;
    }

    try {
      setIsLoadingBulkState(true);
      await handleAddOverlappedSnippetsToReview();
    } catch (error) {
      console.log('## handleBulkAddToReviews');
    } finally {
      setIsLoadingBulkState(false);
    }
  };

  const [numberOfDueSnippets, numberOfReviewDataSnippets] = useMemo(() => {
    if (contentSnippets.length === 0) {
      return [];
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
      <p className='text-xs font-medium m-auto w-fit'>
        Words Due: {contentMetaWordMemoized.length}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Snippets Due: {numberOfDueSnippets}/{numberOfReviewDataSnippets}/
        {contentSnippets.length}
      </p>
      <hr className='my-1' />
      <p className='flex gap-2 text-xs font-medium w-fit m-auto py-2'>
        <div
          className={clsx('relative', isLoadingBulkState ? 'opacity-50' : '')}
        >
          {isLoadingBulkState && (
            <div className='absolute right-4/10 top-1/8'>
              <LoadingSpinner />
            </div>
          )}
          <span className='m-auto mr-2'>
            Bulk Review:{' '}
            {overlappedSentencesViableForReviewMemoizedKeyArray?.length}
          </span>

          <Button
            className='w-5 h-5 align-sub bg-amber-300 border-amber-300'
            variant='outline'
            onDoubleClick={handleBulkAddToReviews}
            disabled={
              isLoadingBulkState ||
              !overlappedSentencesViableForReviewMemoizedKeyArray?.length ||
              overlappedSentencesViableForReviewMemoizedKeyArray?.length === 0
            }
          >
            <SaveAllIcon />
          </Button>
        </div>
      </p>
      <p className='flex gap-2 text-xs font-medium  w-fit m-auto'>
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
      </p>
      {sentenceRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {sentenceRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
