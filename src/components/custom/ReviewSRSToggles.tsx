import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  isMoreThanADayAhead,
  setToFiveAM,
  srsCalculationAndText,
  srsRetentionKeyTypes,
} from '../../app/srs-utils/srs-algo';
import { Trash } from 'lucide-react';
import clsx from 'clsx';
import { useGamePadSRSShortcut } from './useGamePadSRSShortcut';

const ReviewSRSToggles = ({
  contentItem,
  handleReviewFunc,
  isSnippet,
  isVocab,
  isReadyForQuickReview,
}) => {
  const [isLoadingSRSState, setIsLoadingSRSState] = useState(false);
  const reviewData = contentItem.reviewData;

  const timeNow = new Date();

  const {
    nextScheduledOptions,
    againText,
    hardText,
    goodText,
    easyText,
    isScheduledForDeletion,
  } = srsCalculationAndText({
    reviewData,
    contentType: isSnippet
      ? srsRetentionKeyTypes.snippet
      : isVocab
        ? srsRetentionKeyTypes.vocab
        : srsRetentionKeyTypes.sentences,
    timeNow,
  });

  const handleNextReview = async (difficulty) => {
    const nextReviewData = nextScheduledOptions[difficulty].card;
    const isMoreThanADayAheadBool = isMoreThanADayAhead(
      nextReviewData.due,
      new Date(),
    );

    const formattedToBe5am = isMoreThanADayAheadBool
      ? { ...nextReviewData, due: setToFiveAM(nextReviewData.due) }
      : nextReviewData;

    try {
      setIsLoadingSRSState(true);
      if (isVocab) {
        await handleReviewFunc({
          wordId: contentItem.id,
          fieldToUpdate: { reviewData: formattedToBe5am },
        });
      } else if (isSnippet) {
        await handleReviewFunc({
          snippetData: {
            ...contentItem,
            reviewData: formattedToBe5am,
          },
        });
      } else {
        await handleReviewFunc({
          sentenceId: contentItem.id,
          nextDue: formattedToBe5am,
        });
      }
    } finally {
      setIsLoadingSRSState(false);
    }
  };
  const handleRemoveReview = async () => {
    try {
      setIsLoadingSRSState(true);
      if (isVocab) {
        await handleReviewFunc({
          wordId: contentItem.id,
          isRemoveReview: true,
        });
      } else if (isSnippet) {
        await handleReviewFunc({
          snippetData: {
            ...contentItem,
            reviewData: undefined,
          },
          isRemoveReview: true,
        });
      } else {
        await handleReviewFunc({
          sentenceId: contentItem.id,
          isRemoveReview: true,
        });
      }
    } catch (error) {
      console.log('## handleRemoveReview', { error });
    } finally {
      setIsLoadingSRSState(false);
    }
  };

  const reviewTogglesMap = [
    {
      disabled: isLoadingSRSState,
      text: againText,
      difficultyNumber: '1',
      dataTestId: `again-${contentItem.id}`,
    },
    {
      disabled: isLoadingSRSState,
      text: hardText,
      difficultyNumber: '2',
      dataTestId: `hard-${contentItem.id}`,
    },
    {
      disabled: isLoadingSRSState,
      text: goodText,
      difficultyNumber: '3',
      dataTestId: `good-${contentItem.id}`,
    },
    {
      disabled: isLoadingSRSState || isScheduledForDeletion,
      text: easyText,
      difficultyNumber: '4',
      dataTestId: `easy-${contentItem.id}`,
    },
  ];

  useGamePadSRSShortcut({
    isReadyForQuickReview,
    isLoadingSRSState,
    handleNextReview,
    handleRemoveReview,
  });

  return (
    <div
      className={clsx(
        'flex gap-1 m-1 justify-center',
        isLoadingSRSState && 'opacity-25',
      )}
      data-testid={`review-srs-toggles-${contentItem.id}`}
    >
      {reviewTogglesMap.map((btn, index) => (
        <Button
          key={index}
          variant='outline'
          disabled={btn.disabled}
          onClick={() => handleNextReview(btn.difficultyNumber)}
          data-testid={btn.dataTestId}
          className={clsx(
            isReadyForQuickReview && btn.difficultyNumber === '4'
              ? 'animate-pulse bg-green-400'
              : '',
          )}
        >
          {btn.text}
        </Button>
      ))}
      <Button
        variant='destructive'
        data-testid={`review-srs-toggles-remove-${contentItem.id}`}
        className={clsx(
          isScheduledForDeletion ? 'animate-pulse bg-amber-500' : '',
        )}
        disabled={isLoadingSRSState}
        onClick={handleRemoveReview}
      >
        <Trash />
      </Button>
    </div>
  );
};

export default ReviewSRSToggles;
