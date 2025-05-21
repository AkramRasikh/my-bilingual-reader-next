'use client';
import { useEffect, useRef, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import { useHighlightWordToWordBank } from './useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';
import KeyListener from './KeyListener';

const VideoPlayer = ({ url, ref, handleTimeUpdate, setIsVideoPlaying }) => {
  const videoUrl = url;

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

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
};

const LearningScreen = ({
  ref,
  selectedContentState,
  handlePlayFromHere,
  handleTimeUpdate,
  wordsState,
  pureWords,
  clearTopic,
  currentTime,
}) => {
  const [formattedTranscriptState, setFormattedTranscriptState] = useState();
  const [secondsState, setSecondsState] = useState();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const generalTopic = getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const realStartTime = selectedContentState.realStartTime;

  const { underlineWordsInSentence } = useHighlightWordToWordBank({
    pureWordsUnique: pureWords,
  });

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

  const isNumber = (value) => {
    return typeof value === 'number';
  };

  const masterPlay =
    currentTime &&
    secondsState?.length > 0 &&
    secondsState[Math.floor(currentTime)];

  const handlePause = () => ref.current.pause();

  const handleJumpToSentenceViaKeys = (nextIndex: number) => {
    // defo revisit this
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[Math.floor(ref.current.currentTime)];

    const thisSentenceIndex = formattedTranscriptState.findIndex(
      (item) => item.id === currentMasterPlay,
    );
    const isLastIndex =
      thisSentenceIndex + 1 === formattedTranscriptState.length;

    if (thisSentenceIndex === 0 && nextIndex === -1) {
      handleFromHere(formattedTranscriptState[thisSentenceIndex]?.time);
    } else if (isLastIndex) {
      handleFromHere(formattedTranscriptState[thisSentenceIndex]?.time);
    } else {
      handleFromHere(
        formattedTranscriptState[thisSentenceIndex + nextIndex]?.time,
      );
    }
  };

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
            ref={ref}
            url={videoUrl}
            handleTimeUpdate={handleTimeUpdate}
            setIsVideoPlaying={setIsVideoPlaying}
          />
          <KeyListener
            isVideoPlaying={isVideoPlaying}
            handleJumpToSentenceViaKeys={handleJumpToSentenceViaKeys}
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
              <span>
                {targetLangformatted.map((item, index) => {
                  const isUnderlined = item?.style?.textDecorationLine;
                  const text = item?.text;
                  return (
                    <span
                      key={index}
                      style={{
                        textDecorationLine: isUnderlined ? 'underline' : 'none',
                      }}
                    >
                      {text}
                    </span>
                  );
                })}
              </span>
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
                  style={{
                    padding: 5,
                    background: 'grey',
                    borderRadius: 5,
                    margin: 'auto 0',
                  }}
                  onClick={
                    thisSentenceIsPlaying && isVideoPlaying
                      ? handlePause
                      : () => handleFromHere(thisTime)
                  }
                >
                  <span
                    style={{
                      height: 16,
                    }}
                  >
                    {thisSentenceIsPlaying && isVideoPlaying ? 'Pause' : 'Play'}
                  </span>
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
    // console.log('## handlePlayFromHere ', {
    //   time,
    //   videoRef: videoRef.current.currentTime,
    // });
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
