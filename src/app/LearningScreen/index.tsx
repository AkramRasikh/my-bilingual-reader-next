'use client';
import { useEffect } from 'react';
import { getFirebaseVideoURL } from '../get-firebase-media-url';
import { getGeneralTopicName } from '../get-general-topic-name';
import { japanese } from '../languages';
import KeyListener from '../KeyListener';
import VideoPlayer from '../VideoPlayer';
import useData from '../useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-algo';
import ComprehensiveTranscriptItem from '../ComprehensiveTranscriptItem';
import useLearningScreen from './useLearningScreen';
import { ContentSectionsForReciew } from '../ContentSelection';
import LearningScreenContentContainer from './LearningScreenContentContainer';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import LearningScreenActionBar from './LearningScreenActionBar';

const LearningScreen = () => {
  const {
    formattedTranscriptState,
    secondsState,
    setSecondsState,
    masterPlayComprehensiveState,
    setIsVideoPlaying,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    showOnVideoTranscriptState,
  } = useLearningScreen();

  const {
    sentenceReviewBulk,
    updateContentMetaData,
    getNextTranscript,
    selectedContentState,
    checkIsThereFollowingContent,
  } = useData();

  const isFullReview = selectedContentState?.isFullReview;

  const generalTopic = isFullReview
    ? selectedContentState.title
    : getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const contentIndex = selectedContentState?.contentIndex;

  const reviewHistory = selectedContentState?.reviewHistory;
  const hasContentToReview = content?.some(
    (sentenceWidget) => sentenceWidget?.reviewData,
  );

  const handleBulkReviews = async () => {
    const emptyCard = getEmptyCard();

    const nextScheduledOptions = getNextScheduledOptions({
      card: emptyCard,
      contentType: srsRetentionKeyTypes.sentences,
    });
    const nextDueCard = nextScheduledOptions['2'].card;
    await sentenceReviewBulk({
      topicName: selectedContentState.title,
      fieldToUpdate: {
        reviewData: nextDueCard,
      },
      contentIndex: contentIndex,
      removeReview: hasContentToReview,
    });
  };

  if (!formattedTranscriptState) {
    return null;
  }

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = checkIsThereFollowingContent(
    selectedContentState.contentIndex,
    selectedContentState.generalTopicName,
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        width: 'fit-content',
        margin: 'auto',
        marginTop: 20,
      }}
    >
      <ContentSectionsForReciew />
      <div className='flex-1 max-w-xl mx-auto'>
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          handleTimeUpdate={handleTimeUpdate}
          setIsVideoPlaying={setIsVideoPlaying}
          masterPlayComprehensiveState={
            showOnVideoTranscriptState && masterPlayComprehensiveState
          }
        />
        <LearningScreenActionBar />

        {threeSecondLoopState && <LearningScreenLoopUI />}
        {masterPlayComprehensiveState && (
          <ComprehensiveTranscriptItem
            contentItem={masterPlayComprehensiveState}
          />
        )}
        <KeyListener />
      </div>
      {secondsState && (
        <LearningScreenContentContainer
          hasPreviousVideo={hasPreviousVideo}
          hasFollowingVideo={hasFollowingVideo}
          getNextTranscript={getNextTranscript}
          setSecondsState={setSecondsState}
          hasContentToReview={hasContentToReview}
          handleBulkReviews={handleBulkReviews}
          reviewHistory={reviewHistory}
          updateContentMetaData={updateContentMetaData}
          topicName={!isFullReview && selectedContentState?.title}
          contentIndex={contentIndex}
        />
      )}
    </div>
  );
};

export default LearningScreen;
