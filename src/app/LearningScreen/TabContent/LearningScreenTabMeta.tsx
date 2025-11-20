'use client';

import { useState } from 'react';
import LoadingSpinner from '../../../components/custom/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';

const LearningScreenTabMeta = ({ updateContentMetaData }) => {
  const { selectedContentState } = useLearningScreen();

  const url = selectedContentState?.url;
  const reviewHistory = selectedContentState?.reviewHistory;
  const contentIndex = selectedContentState?.contentIndex;
  const id = selectedContentState.id;

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
          contentIndex,
          indexKey: id,
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
          contentIndex,
          fieldToUpdate,
          indexKey: id,
        });
      }
    } catch (error) {
      console.log('## setNextReviewDate error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value='meta' className={'p-1 max-h-150 overflow-y-auto'}>
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
        <div>
          <span className='mr-2'>Youtube:</span>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:underline'
          >
            {url}
          </a>
        </div>
      </div>
    </TabsContent>
  );
};

export default LearningScreenTabMeta;
