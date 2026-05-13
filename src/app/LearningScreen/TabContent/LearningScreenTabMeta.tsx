'use client';

import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../../components/custom/LoadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useLearningScreen from '../useLearningScreen';
import ClickAndConfirm from '@/components/custom/ClickAndConfirm';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { getCloudflareVideoURL } from '@/utils/get-media-url';

const LearningScreenTabMeta = () => {
  const [showConfirmDeleteVideo, setShowConfirmDeleteVideo] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { updateContentMetaData, deleteContent, deleteVideo, languageSelectedState } = useFetchData();

  const { selectedContentState, wordsForSelectedTopic } = useLearningScreen();

  const url = selectedContentState?.url;
  const reviewHistory = selectedContentState?.reviewHistory;
  const description = selectedContentState?.description;
  const origin = selectedContentState?.origin;
  const title = selectedContentState?.title;
  const contentIndex = selectedContentState?.contentIndex;
  const contentId = selectedContentState.id;

  const hasBeenReviewed = Boolean(reviewHistory?.length);

  const [isLoading, setIsLoading] = useState(false);
  const [descriptionInputState, setDescriptionInputState] = useState('');
  const [savedDescriptionState, setSavedDescriptionState] = useState('');
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);

  const fallbackDescription = useMemo(() => {
    if (origin === 'youtube' && url) {
      return `This is a youtube video from ${url}`;
    }
    return '';
  }, [origin, url]);

  useEffect(() => {
    const startDescription = description || fallbackDescription;
    setDescriptionInputState(startDescription);
    setSavedDescriptionState(startDescription);
  }, [description, fallbackDescription, contentId]);

  const hasUnsavedDescriptionChanges =
    descriptionInputState.trim() !== savedDescriptionState.trim();

  const today = new Date();

  const updateExistingReviewHistory = () => {
    return [...(reviewHistory || []), new Date()];
  };

  const setFutureReviewDate = (today: Date) => {
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
            nextReview: undefined,
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
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const deleteThisVideo = async () => {
    try {
      setIsLoading(true);
      // Extract video path from URL
      // Assuming URL format contains the video path like "japanese-video/filename.mp4"

      const videoPath = getCloudflareVideoURL(
        title,
        languageSelectedState,
        false,
      );
      await deleteVideo(videoPath);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDescription = async () => {
    if (!hasUnsavedDescriptionChanges) {
      return;
    }

    try {
      setIsDescriptionLoading(true);
      const nextDescription = descriptionInputState.trim();
      await updateContentMetaData({
        contentIndex,
        contentId,
        fieldToUpdate: {
          description: nextDescription,
        },
      });
      setSavedDescriptionState(nextDescription);
    } catch (error) {
      console.log('## handleUpdateDescription error', error);
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  return (
    <TabsContent
      value='meta'
      className={'p-1 max-h-130 min-[1367px]:max-h-150 overflow-y-auto'}
    >
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

        <div className='w-full'>
          <Label className='mb-2 block'>Description</Label>
          <Textarea
            value={descriptionInputState}
            onChange={(e) => setDescriptionInputState(e.target.value)}
            placeholder={fallbackDescription || 'Add a description'}
            disabled={isDescriptionLoading}
            className='min-h-24'
          />
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>
              {hasUnsavedDescriptionChanges
                ? 'Unsaved changes'
                : 'No changes'}
            </span>
            <Button
              onClick={handleUpdateDescription}
              disabled={!hasUnsavedDescriptionChanges || isDescriptionLoading}
              size='sm'
            >
              {isDescriptionLoading ? 'Saving...' : 'Save description'}
            </Button>
          </div>
        </div>

        <div>
          <Label className='mb-2'>Delete Video from Cloudflare</Label>
          <ClickAndConfirm
            showConfirm={showConfirmDeleteVideo}
            setShowConfirm={setShowConfirmDeleteVideo}
            onClick={deleteThisVideo}
            isLoadingState={isLoading}
          />
        </div>

        <div>
          <Label className='mb-2'>Delete all content - words, videos and content itself</Label>
          <ClickAndConfirm
            showConfirm={showConfirmDelete}
            setShowConfirm={setShowConfirmDelete}
            onClick={deleteThisContent}
            isLoadingState={isLoading}
          />
        </div>

      </div>
    </TabsContent>
  );
};

export default LearningScreenTabMeta;
