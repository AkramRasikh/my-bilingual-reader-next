'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CountdownTimer from './CountDownTimer';

export const TabMetaContentData = ({
  hasContentToReview,
  handleBulkReviews,
  reviewHistory,
  updateContentMetaData,
  topicName,
  contentIndex,
}: {
  hasContentToReview: boolean;
  handleBulkReviews: (action: 'add' | 'remove') => Promise<void>;
}) => {
  const hasBeenReviewed = reviewHistory?.length > 0;

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();

  const action = hasContentToReview ? 'remove' : 'add';

  const handlePrimaryClick = () => {
    setShowConfirm(true);
  };

  const updateExistingReviewHistory = () => {
    return [...reviewHistory, new Date()];
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await handleBulkReviews(action);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
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

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className='flex flex-col items-start gap-2  my-2'>
      <div className='flex gap-2 mx-auto flex-wrap'>
        <Button onClick={handlePrimaryClick} disabled={isLoading}>
          {hasContentToReview ? 'Remove bulk review' : 'Add bulk review'}
        </Button>
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

      {showConfirm && !isLoading && (
        <div className='flex gap-2 mt-2 mx-auto'>
          <button
            onClick={handleConfirm}
            className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700'
          >
            Confirm {action}
          </button>
          <button
            onClick={handleCancel}
            className='px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default function ContentActionBar({
  isInReviewMode,
  setIsInReviewMode,
  onlyShowEngState,
  setOnlyShowEngState,
  showOnVideoTranscriptState,
  setShowOnVideoTranscriptState,
  ref,
}: {
  hasContentToReview: boolean;
  handleBulkReviews: (action: 'add' | 'remove') => Promise<void>;
}) {
  return (
    <div className='flex flex-col items-start gap-2 my-2 p-2'>
      <div className='flex gap-2 mx-auto flex-wrap'>
        <div className='flex gap-2 m-auto'>
          <Label>Review Mode</Label>
          <Switch
            checked={isInReviewMode}
            onCheckedChange={setIsInReviewMode}
          />
        </div>
        <div className='flex gap-2 m-auto'>
          <Label>🇬🇧</Label>
          <Switch
            checked={!onlyShowEngState}
            onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
          />
        </div>
        <div className='flex gap-2 m-auto'>
          <Label>Subtitles</Label>
          <Switch
            checked={showOnVideoTranscriptState}
            onCheckedChange={setShowOnVideoTranscriptState}
          />
        </div>
        <CountdownTimer audioTimeRef={ref} />
      </div>
    </div>
  );
}
