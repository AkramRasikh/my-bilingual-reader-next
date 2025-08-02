import { Button } from '@/components/ui/button';
import { srsCalculationAndText, srsRetentionKeyTypes } from './srs-algo';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const ReviewSRSToggles = ({ contentItem, handleReviewFunc, isVocab }) => {
  const [isLoadingSRSState, setIsLoadingSRSState] = useState(false);
  const reviewData = contentItem.reviewData;

  const timeNow = new Date();

  const { nextScheduledOptions, againText, hardText, goodText, easyText } =
    srsCalculationAndText({
      reviewData,
      contentType: isVocab
        ? srsRetentionKeyTypes.vocab
        : srsRetentionKeyTypes.sentences,
      timeNow,
    });

  const handleNextReview = async (difficulty) => {
    const nextReviewData = nextScheduledOptions[difficulty].card;
    try {
      setIsLoadingSRSState(true);
      if (isVocab) {
        await handleReviewFunc({
          wordId: contentItem.id,
          fieldToUpdate: { reviewData: nextReviewData },
          language: 'japanese',
        });
      } else {
        await handleReviewFunc({
          sentenceId: contentItem.id,
          nextDue: nextReviewData,
        });
      }
    } catch (error) {
      console.log('## handleNextReview', { error });
    } finally {
      setIsLoadingSRSState(false);
    }
  };
  const handleRemoveReviewReview = async () => {
    try {
      setIsLoadingSRSState(true);
      if (isVocab) {
        await handleReviewFunc({
          wordId: contentItem.id,
          language: 'japanese',
          isRemoveReview: true,
        });
      } else {
        await handleReviewFunc({
          sentenceId: contentItem.id,
          isRemoveReview: true,
        });
      }
    } catch (error) {
      console.log('## handleRemoveReviewReview', { error });
    } finally {
      setIsLoadingSRSState(false);
    }
  };

  return (
    <div
      className={clsx(
        'flex gap-1 m-1 justify-center',
        isLoadingSRSState && 'opacity-25',
      )}
    >
      <Button
        variant='outline'
        disabled={isLoadingSRSState}
        onClick={() => handleNextReview('1')}
      >
        {againText}
      </Button>
      <Button
        variant='outline'
        disabled={isLoadingSRSState}
        onClick={() => handleNextReview('2')}
      >
        {hardText}
      </Button>
      <Button
        variant='outline'
        disabled={isLoadingSRSState}
        onClick={() => handleNextReview('3')}
      >
        {goodText}
      </Button>
      <Button
        variant='outline'
        disabled={isLoadingSRSState}
        onClick={() => handleNextReview('4')}
      >
        {easyText}
      </Button>
      <Button
        variant='destructive'
        disabled={isLoadingSRSState}
        onClick={handleRemoveReviewReview}
      >
        <Trash />
      </Button>
    </div>
  );
};

export default ReviewSRSToggles;
