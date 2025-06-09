'use client';
import { useEffect, useRef, useState } from 'react';
import LearningScreen from './LearningScreen';
import useData from './useData';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import checkIfVideoExists from './check-if-video-exists';

export const HomeContainer = () => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [youtubeContentTagsState, setYoutubeContentTags] = useState();

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
      const generalTopicNameTags: string[] = [];
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
        } else if (contentItem?.origin === 'youtube' && contentItem?.hasVideo) {
          youtubeContentTags.push({
            title: contentItem.title,
            reviewed: contentItem?.reviewHistory,
          });
          generalTopicNameTags.push(generalTopicName);
        }
      }

      setYoutubeContentTags(youtubeContentTags);
    };

    loadYoutubeTags();
  }, []);

  return (
    <div style={{ padding: 10 }}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!selectedContentState &&
          youtubeContentTagsState?.length > 0 &&
          youtubeContentTagsState.map((youtubeTag, index) => {
            const title = youtubeTag.title;
            const reviewed = youtubeTag.reviewed?.length > 0;

            return (
              <li key={index}>
                <button
                  onClick={() => handleSelectedContent(title)}
                  style={{
                    border: '1px solid grey',
                    padding: 3,
                    backgroundColor: reviewed ? 'red' : 'lightgray',
                    borderRadius: 5,
                  }}
                >
                  {title}
                </button>
              </li>
            );
          })}
      </ul>
      {selectedContentState && (
        <LearningScreen
          selectedContentState={selectedContentState}
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
