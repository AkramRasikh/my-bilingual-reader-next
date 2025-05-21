'use client';
import { createContext, useRef, useState } from 'react';
import LearningScreen from './LearningScreen';

export const DataContext = createContext(null);

export const DataProvider = ({
  targetLanguageLoadedWords,
  pureWords,
  children,
}: PropsWithChildren<object>) => {
  return (
    <DataContext.Provider
      value={{
        targetLanguageLoadedWords,
        pureWords,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const HomeContainer = ({
  targetLanguageLoadedSentences,
  targetLanguageLoadedWords,
  targetLanguageLoadedSnippetsWithSavedTag,
  sortedContent,
  pureWords,
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

  const clearTopic = () => setSelectedContentState(null);

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
          pureWords={pureWords}
          clearTopic={clearTopic}
          currentTime={currentTime}
          wordsState={wordsState}
        />
      )}
    </div>
  );
};
