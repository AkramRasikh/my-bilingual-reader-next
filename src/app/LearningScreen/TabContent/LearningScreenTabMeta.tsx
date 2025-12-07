'use client';

import { useState } from 'react';
import LoadingSpinner from '../../../components/custom/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
// import ClickAndConfirm from '@/components/custom/ClickAndConfirm';
import { useFetchData } from '@/app/Providers/FetchDataProvider';

const LearningScreenTabMeta = ({ updateContentMetaData }) => {
  // const [showConfirm, setShowConfirm] = useState(false);
  const { deleteContent } = useFetchData();

  const { selectedContentState, wordsForSelectedTopic } = useLearningScreen();

  const url = selectedContentState?.url;
  const reviewHistory = selectedContentState?.reviewHistory;
  const title = selectedContentState?.title;
  const contentIndex = selectedContentState?.contentIndex;
  const contentId = selectedContentState.id;

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
          contentId,
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
          contentId,
        });
      }
    } catch (error) {
      console.log('## setNextReviewDate error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteThisContent = async () => {
    try {
      setIsLoading(true);
      await deleteContent({
        contentId,
        title,
        wordIds: wordsForSelectedTopic?.map((item) => item.id),
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value='meta' className={'p-1 max-h-150 overflow-y-auto'}>
      <div className='flex flex-col items-start gap-2 my-2'>
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
        {/* <div>
          <ClickAndConfirm
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
            onClick={deleteThisContent}
            isLoadingState={isLoading}
          />
        </div>
        should be conditional if you want words too */}
      </div>
    </TabsContent>
  );
};

export default LearningScreenTabMeta;
