'use client';
import { useEffect, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import { useHighlightWordToWordBank } from './useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';
import KeyListener from './KeyListener';
import VideoPlayer from './VideoPlayer';

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

    if (thisSentenceIndex === -1) {
      return;
    }
    if ((thisSentenceIndex === 0 && nextIndex === -1) || isLastIndex) {
      handleFromHere(formattedTranscriptState[thisSentenceIndex]?.time);
    } else {
      handleFromHere(
        formattedTranscriptState[thisSentenceIndex + nextIndex]?.time,
      );
    }
  };

  const handleFromHere = (time) => {
    if (!isNumber(time)) {
      return null;
    }
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
        <button
          style={{
            background: 'grey',
            borderRadius: 5,
            margin: 'auto 0',
            marginRight: 5,
            padding: 5,
          }}
          onClick={clearTopic}
        >
          BACK
        </button>
        {selectedContentState?.title}
      </h1>
      {/* Actions here */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          width: 'fit-content',
          margin: 'auto',
          marginTop: 100,
        }}
      >
        <div
          style={{
            maxHeight: 500,
            margin: 'auto',
          }}
        >
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
        {secondsState && (
          <div
            style={{ maxHeight: '600px', margin: 'auto', overflowY: 'auto' }}
          >
            <ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                margin: 'auto',
                overflow: 'scroll',
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
                            textDecorationLine: isUnderlined
                              ? 'underline'
                              : 'none',
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
                        {thisSentenceIsPlaying && isVideoPlaying
                          ? 'Pause'
                          : 'Play'}
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
        )}
      </div>
    </div>
  );
};

export default LearningScreen;
