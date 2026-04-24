import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { HistoryIcon, SaveAllIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import clsx from 'clsx';

interface LearningScreenUnifiedAnalyticsProps {
  sentenceRepsPerMinState: string | null;
  wordRepsPerMinState: string | null;
  snippetRepsPerMinState: string | null;
}

const LearningScreenUnifiedAnalytics = ({
  sentenceRepsPerMinState,
  wordRepsPerMinState,
  snippetRepsPerMinState,
}: LearningScreenUnifiedAnalyticsProps) => {
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
    wordRepsState,
    setWordRepsState,
    snippetRepsState,
    setSnippetRepsState,
  } = useLearningScreen();

  const handleClearReps = () => {
    setSentenceRepsState(0);
    setWordRepsState(0);
    setSnippetRepsState(0);
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

  const totalRepsPerMinState = useMemo(() => {
    const repsPerMinuteValues = [
      sentenceRepsPerMinState,
      wordRepsPerMinState,
      snippetRepsPerMinState,
    ]
      .map((value) => (value ? Number(value) : null))
      .filter((value): value is number => value !== null && !Number.isNaN(value));

    if (repsPerMinuteValues.length === 0) {
      return null;
    }

    const total = repsPerMinuteValues.reduce((sum, value) => sum + value, 0);
    return total.toFixed(1);
  }, [sentenceRepsPerMinState, snippetRepsPerMinState, wordRepsPerMinState]);

  const repsPerMinSplit = useMemo(() => {
    const sentence = sentenceRepsPerMinState ? Number(sentenceRepsPerMinState) : 0;
    const word = wordRepsPerMinState ? Number(wordRepsPerMinState) : 0;
    const snippet = snippetRepsPerMinState ? Number(snippetRepsPerMinState) : 0;
    const total = sentence + word + snippet;

    if (total <= 0) {
      return null;
    }

    return {
      sentencePct: (sentence / total) * 100,
      wordPct: (word / total) * 100,
      snippetPct: (snippet / total) * 100,
    };
  }, [sentenceRepsPerMinState, snippetRepsPerMinState, wordRepsPerMinState]);

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
      <div className='flex flex-col gap-2 items-center'>
        <div className='flex gap-2 text-xs font-medium w-fit m-auto items-center'>
          <span className='m-auto' data-testid='analytics-reps-count'>
            📝 Reps: {sentenceRepsState}
          </span>
          {sentenceRepsPerMinState && (
            <span className='m-auto text-muted-foreground'>
              ({sentenceRepsPerMinState}/min)
            </span>
          )}
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
        <div className='flex gap-2 text-xs font-medium w-fit m-auto items-center'>
          <span data-testid='analytics-reps-count-words'>
            🔤 reps: {wordRepsState}
          </span>
          {wordRepsPerMinState && (
            <span className='text-muted-foreground'>
              ({wordRepsPerMinState}/min)
            </span>
          )}
        </div>
        <div className='flex gap-2 text-xs font-medium w-fit m-auto items-center'>
          <span data-testid='analytics-reps-count-snippets'>
            ✂️ reps: {snippetRepsState}
          </span>
          {snippetRepsPerMinState && (
            <span className='text-muted-foreground'>
              ({snippetRepsPerMinState}/min)
            </span>
          )}
        </div>
      </div>
      {totalRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit text-muted-foreground'>
          Total/Min: {totalRepsPerMinState}
        </p>
      )}
      {repsPerMinSplit && (
        <div className='w-40 h-2 rounded-full overflow-hidden flex m-auto mt-1'>
          <span
            className='bg-green-500 h-full'
            style={{ width: `${repsPerMinSplit.sentencePct}%` }}
          />
          <span
            className='bg-amber-500 h-full'
            style={{ width: `${repsPerMinSplit.wordPct}%` }}
          />
          <span
            className='bg-red-500 h-full'
            style={{ width: `${repsPerMinSplit.snippetPct}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
