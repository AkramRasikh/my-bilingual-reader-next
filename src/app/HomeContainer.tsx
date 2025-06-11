'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreen from './LearningScreen';
import useData from './useData';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import checkIfVideoExists from './check-if-video-exists';
import ContentSelection from './ContentSelection';
import LoadingSpinner from './LoadingSpinner';

export const HomeContainer = () => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [youtubeContentTagsState, setYoutubeContentTags] = useState();
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [generalTopicDisplayNameState, setGeneralTopicDisplayNameState] =
    useState([]);
  const [
    generalTopicDisplayNameSelectedState,
    setGeneralTopicDisplayNameSelectedState,
  ] = useState('');

  const [currentTime, setCurrentTime] = useState(0);

  const { contentState, selectedContentState, setSelectedContentState } =
    useData();

  const handlePlayFromHere = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const clearTopic = () => setSelectedContentState(null);

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSelectedContent = (thisYoutubeTitle) => {
    const thisContent = contentState.find(
      (item) => item?.title === thisYoutubeTitle,
    );
    setSelectedContentState(thisContent);
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

          if (generalTopicNameTags.includes(generalTopicName)) {
            youtubeContentTags.push({
              title: contentItem.title,
              reviewed: contentItem?.reviewHistory,
            });
          } else if (
            contentItem?.origin === 'youtube' &&
            contentItem?.hasVideo
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
        setYoutubeContentTags(youtubeContentTags);
      } catch (error) {
      } finally {
        setIsLoadingState(false);
      }
    };

    loadYoutubeTags();
  }, []);

  return (
    <div style={{ padding: 10 }}>
      {!selectedContentState &&
        generalTopicDisplayNameSelectedState &&
        youtubeContentTagsState?.length > 0 && (
          <button onClick={() => setGeneralTopicDisplayNameSelectedState('')}>
            Clear
          </button>
        )}
      {isLoadingState && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        >
          <LoadingSpinner />
        </div>
      )}
      <ContentSelection
        generalTopicDisplayNameSelectedState={
          generalTopicDisplayNameSelectedState
        }
        generalTopicDisplayNameState={generalTopicDisplayNameState}
        setGeneralTopicDisplayNameSelectedState={
          setGeneralTopicDisplayNameSelectedState
        }
        selectedContentState={selectedContentState}
        youtubeContentTagsState={youtubeContentTagsState}
        handleSelectedContent={handleSelectedContent}
      />
      {selectedContentState && (
        <LearningScreen
          handlePlayFromHere={handlePlayFromHere}
          handleTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          clearTopic={clearTopic}
          currentTime={currentTime}
        />
      )}
    </div>
  );
};
