'use client';

import { useState } from 'react';
import LoadingSpinner from '../components/custom/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const TabMetaContentData = ({
  reviewHistory,
  updateContentMetaData,
  topicName,
  contentIndex,
}: {
  hasContentToReview: boolean;
  handleBulkReviews: (action: 'add' | 'remove') => Promise<void>;
}) => {
  const hasBeenReviewed = reviewHistory?.length > 0;

  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();

  const updateExistingReviewHistory = () => {
    return [...reviewHistory, new Date()];
  };

  const setFutureReviewDate = (today) => {
    const futureDateWithDays = new Date(today.setDate(today.getDate() + 3));

    return futureDateWithDays;
  };

  const setNextReviewDate = async () => {
    try {
      setIsLoading(true);
      if (hasBeenReviewed) {
        await updateContentMetaData({
          topicName,
          contentIndex,
          fieldToUpdate: {
            reviewHistory: [],
            nextReview: null,
          },
        });
      } else {
        const fieldToUpdate = {
          reviewHistory: hasBeenReviewed
            ? updateExistingReviewHistory()
            : [new Date()],
          nextReview: setFutureReviewDate(today),
        };

        await updateContentMetaData({
          topicName,
          contentIndex,
          fieldToUpdate,
        });
      }
    } catch (error) {
      console.log('## setNextReviewDate error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-start gap-2  my-2'>
      {isLoading && (
        <div className='m-auto'>
          <LoadingSpinner />
        </div>
      )}
      <div className='flex gap-2 m-auto'>
        <Label>Reviewed </Label>
        <Switch
          checked={hasBeenReviewed}
          onCheckedChange={setNextReviewDate}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
