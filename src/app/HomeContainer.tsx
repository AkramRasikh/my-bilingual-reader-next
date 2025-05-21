'use client';
import { useEffect, useRef, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import { useHighlightWordToWordBank } from './useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';

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
  wordsState,
  ref,
  pureWords,
  clearTopic,
  currentTime,
}) => {
  const [formattedTranscriptState, setFormattedTranscriptState] = useState();
  const [secondsState, setSecondsState] = useState();

  const generalTopic = getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const realStartTime = selectedContentState.realStartTime;

  useEffect(() => {
    if (ref.current?.duration && !secondsState) {
      const arrOfSeconds = mapSentenceIdsToSeconds({
        content,
        duration: ref.current?.duration,
        isVideoModeState: true,
        realStartTime,
      });

      setSecondsState(arrOfSeconds);
    }
  }, [ref.current, secondsState, content, realStartTime]);

  const masterPlay =
    currentTime &&
    secondsState?.length > 0 &&
    secondsState[Math.floor(currentTime)];

  const { underlineWordsInSentence } = useHighlightWordToWordBank({
    pureWordsUnique: pureWords,
  });

  const handleFromHere = (time) => {
    const thisStartTime = realStartTime + time;
    handlePlayFromHere(thisStartTime);
  };

  useEffect(() => {
    const formattedTranscript = content.map((item) => {
      return {
        ...item,
        targetLangformatted: underlineWordsInSentence(item.targetLang),
      };
    });

    setFormattedTranscriptState(formattedTranscript);
  }, [wordsState]);

  if (!formattedTranscriptState) {
    return null;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>
        <button onClick={clearTopic}>BACK</button>
        {selectedContentState?.title}
      </h1>
      <div
        style={{
          display: 'flex',
          gap: 20,
          width: 'fit-content',
          margin: 'auto',
        }}
      >
        <div>
          <VideoPlayer
            url={videoUrl}
            handleTimeUpdate={handleTimeUpdate}
            ref={ref}
          />
        </div>
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            margin: 'auto',
          }}
        >
          {formattedTranscriptState.map((contentItem, index) => {
            const numberOrder = index + 1 + ') ';
            const baseLang = contentItem.baseLang;
            const targetLangformatted = contentItem.targetLangformatted;
            const id = contentItem.id;
            const thisTime = contentItem.time;
            const thisSentenceIsPlaying = contentItem.id === masterPlay;

            const formattedSentence = (
              <p>
                {targetLangformatted.map((item) => {
                  const isUnderlined = item?.style?.textDecorationLine;
                  const text = item?.text;
                  return (
                    <span
                      style={{
                        textDecorationLine: isUnderlined ? 'underline' : 'none',
                      }}
                    >
                      {text}
                    </span>
                  );
                })}
              </p>
            );

            return (
              <li
                key={id}
                style={{
                  display: 'flex',
                  gap: 5,
                }}
              >
                <button
                  style={{ padding: 5, background: 'grey', borderRadius: 5 }}
                  onClick={() => handleFromHere(thisTime)}
                >
                  PLAY
                </button>
                <div
                  style={{
                    background: thisSentenceIsPlaying ? 'yellow' : 'none',
                  }}
                >
                  <p style={{ display: 'flex', gap: 3 }}>
                    <span>{numberOrder}</span>
                    {formattedSentence}
                  </p>
                  {baseLang}
                </div>
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
        />
      )}
    </div>
  );
};
