'use client';
import { useRef, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';

export default function VideoPlayer({ url, handleTimeUpdate, ref }) {
  const videoUrl = url;

  return (
    <div className='flex justify-center items-center h-screen'>
      <video
        ref={ref}
        src={videoUrl}
        controls
        className='w-full max-w-3xl rounded-lg shadow-lg'
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

const LearningScreen = ({
  selectedContentState,
  handlePlayFromHere,
  handleTimeUpdate,
  ref,
}) => {
  const generalTopic = getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const realStartTime = selectedContentState.realStartTime;

  const handleFromHere = (time) => {
    const thisStartTime = realStartTime + time;
    handlePlayFromHere(thisStartTime);
  };

  return (
    <div>
      <h1>{selectedContentState?.title}</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <VideoPlayer
            url={videoUrl}
            handleTimeUpdate={handleTimeUpdate}
            ref={ref}
          />
        </div>
        <ul>
          {content.map((contentItem, index) => {
            const numberOrder = index + 1 + ') ';
            const baseLang = contentItem.baseLang;
            const targetLang = contentItem.targetLang;
            const id = contentItem.id;
            const thisTime = contentItem.time;

            return (
              <li key={id}>
                <p>
                  <button
                    style={{ padding: 5, background: 'grey' }}
                    onClick={() => handleFromHere(thisTime)}
                  >
                    PLAY
                  </button>
                  <span>{numberOrder}</span>
                  {baseLang}
                </p>
                <p>{targetLang}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const HomeContainer = ({
  targetLanguageLoadedSentences,
  targetLanguageLoadedWords,
  targetLanguageLoadedSnippetsWithSavedTag,
  sortedContent,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [currentTime, setCurrentTime] = useState(0);

  const [snippetsState, setSnippetsState] = useState(
    targetLanguageLoadedSnippetsWithSavedTag,
  );
  const [learningContentState, setLearningContentState] =
    useState(sortedContent);
  const [wordsState, setWordsState] = useState(targetLanguageLoadedWords);
  const [sentencesState, setSentencesState] = useState(
    targetLanguageLoadedSentences,
  );

  const [selectedContentState, setSelectedContentState] = useState(null);

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

  const handleSelectedContent = (thisYoutubeTitle) => {
    const thisContent = learningContentState.find(
      (item) => item?.title === thisYoutubeTitle,
    );
    setSelectedContentState(thisContent);
  };

  const youtubeContentTags = [];

  learningContentState.forEach((contentItem) => {
    if (contentItem?.origin === 'youtube' && contentItem?.hasVideo) {
      youtubeContentTags.push({
        title: contentItem.title,
        reviewed: contentItem?.reviewHistory,
      });
    }
  });

  return (
    <div style={{ padding: 10 }}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!selectedContentState &&
          youtubeContentTags.map((youtubeTag, index) => {
            const title = youtubeTag.title;
            const reviewed = youtubeTag.reviewed;

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
        />
      )}
    </div>
  );
};
