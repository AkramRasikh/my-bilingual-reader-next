'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../useData';
import { getFirebaseVideoURL } from '../get-firebase-media-url';
import { getGeneralTopicName } from '../get-general-topic-name';
import { japanese } from '../languages';
import checkIfVideoExists from '../check-if-video-exists';
import LandingScreenContentSelection from './LandingScreenContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import SentenceReviewContainer from '../SentenceReviewContainer';
import LandingScreenSpinner from './LandingScreenSpinner';
import LandingScreenMockFlag from './LandingScreenMockFlag';

const LandingScreen = () => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [isLoadingState, setIsLoadingState] = useState(true);

  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const [currentTime, setCurrentTime] = useState(0);

  const {
    contentState,
    selectedContentState,
    generalTopicDisplayNameState,
    setGeneralTopicDisplayNameState,
    generalTopicDisplayNameSelectedState,
    sentencesState,
    toastMessageState,
    setToastMessageState,
    isSentenceReviewState,
    setIsSentenceReviewState,
  } = useData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  const handlePlayFromHere = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    const loadYoutubeTags = async () => {
      try {
        setIsLoadingState(true);
        const generalTopicNameTags: string[] = [];
        const generalTopicDisplayName: string[] = [];
        const youtubeContentTags: { title: string; reviewed?: any }[] = [];

        let youtubeTagsWithoutVideoBoolean: string[] = [];
        for (const contentItem of contentState) {
          if (!contentItem?.hasVideo && contentItem?.origin === 'youtube') {
            const generalTopicName = getFirebaseVideoURL(
              getGeneralTopicName(contentItem.title),
              japanese,
            );
            if (!youtubeTagsWithoutVideoBoolean.includes(generalTopicName)) {
              youtubeTagsWithoutVideoBoolean.push(generalTopicName);
              const videoExists = await checkIfVideoExists(generalTopicName);
              if (videoExists) {
                youtubeContentTags.push({
                  title: contentItem.title,
                  reviewed: contentItem?.reviewHistory,
                });
                generalTopicNameTags.push(generalTopicName);
                generalTopicDisplayName.push(
                  getGeneralTopicName(contentItem.title),
                );
              }
            }
          }
        }

        for (const contentItem of contentState) {
          const generalTopicName = getFirebaseVideoURL(
            getGeneralTopicName(contentItem.title),
            japanese,
          );
          const isInYoutubeContent = youtubeContentTags.some(
            (item) => item.title === contentItem.title,
          );

          if (
            generalTopicNameTags.includes(generalTopicName) &&
            !isInYoutubeContent
          ) {
            youtubeContentTags.push({
              title: contentItem.title,
              reviewed: contentItem?.reviewHistory,
            });
          } else if (
            contentItem?.origin === 'youtube' &&
            contentItem?.hasVideo &&
            !isInYoutubeContent
          ) {
            youtubeContentTags.push({
              title: contentItem.title,
              reviewed: contentItem?.reviewHistory,
            });
            generalTopicNameTags.push(generalTopicName);
            generalTopicDisplayName.push(
              getGeneralTopicName(contentItem.title),
            );
          }
        }

        setGeneralTopicDisplayNameState(generalTopicDisplayName);
      } catch (error) {
      } finally {
        setIsLoadingState(false);
      }
    };

    loadYoutubeTags();
  }, []);

  const numberOfSentences = sentencesState.length;

  if (isSentenceReviewState && sentencesState.length > 0) {
    return <SentenceReviewContainer />;
  }

  return (
    <div style={{ padding: 10 }}>
      {isMockEnv && <LandingScreenMockFlag />}
      {isLoadingState && <LandingScreenSpinner />}
      <LandingScreenContentSelection
        generalTopicDisplayNameSelectedState={
          generalTopicDisplayNameSelectedState
        }
        generalTopicDisplayNameState={generalTopicDisplayNameState}
        isSentenceReviewState={isSentenceReviewState}
        setIsSentenceReviewState={setIsSentenceReviewState}
        numberOfSentences={numberOfSentences}
      />
      {selectedContentState && (
        <LearningScreenProvider
          handlePlayFromHere={handlePlayFromHere}
          handleTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          currentTime={currentTime}
        >
          <LearningScreen />
        </LearningScreenProvider>
      )}
    </div>
  );
};

export default LandingScreen;
