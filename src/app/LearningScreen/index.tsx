'use client';

import { getFirebaseVideoURL } from '../get-firebase-media-url';
import { getGeneralTopicName } from '../get-general-topic-name';
import { japanese } from '../languages';
import KeyListener from '../KeyListener';
import VideoPlayer from '../VideoPlayer';
import useData from '../useData';
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
    masterPlayComprehensiveState,
    setIsVideoPlaying,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    showOnVideoTranscriptState,
  } = useLearningScreen();

  const { updateContentMetaData, getNextTranscript, selectedContentState } =
    useData();

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

  if (!formattedTranscriptState) {
    return null;
  }

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = selectedContentState.hasFollowingVideo;

  return (
    <div className='flex gap-5 w-fit mx-auto'>
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
          hasContentToReview={hasContentToReview}
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
