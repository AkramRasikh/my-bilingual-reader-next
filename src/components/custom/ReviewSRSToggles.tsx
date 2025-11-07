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

const ReviewSRSToggles = ({ contentItem, handleReviewFunc, isVocab }) => {
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
    contentType: isVocab
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
      } else {
        await handleReviewFunc({
          sentenceId: contentItem.id,
          nextDue: formattedToBe5am,
        });
      }
    } catch (error) {
      console.log('## handleNextReview', { error });
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
    { disabled: isLoadingSRSState, text: againText, difficultyNumber: '1' },
    { disabled: isLoadingSRSState, text: hardText, difficultyNumber: '2' },
    { disabled: isLoadingSRSState, text: goodText, difficultyNumber: '3' },
    {
      disabled: isLoadingSRSState || isScheduledForDeletion,
      text: easyText,
      difficultyNumber: '4',
    },
  ];

  return (
    <div
      className={clsx(
        'flex gap-1 m-1 justify-center',
        isLoadingSRSState && 'opacity-25',
      )}
    >
      {reviewTogglesMap.map((btn, index) => (
        <Button
          key={index}
          variant='outline'
          disabled={btn.disabled}
          onClick={() => handleNextReview(btn.difficultyNumber)}
        >
          {btn.text}
        </Button>
      ))}
      <Button
        variant='destructive'
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
