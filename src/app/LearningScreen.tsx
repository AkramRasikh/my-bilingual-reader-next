'use client';
import { useEffect, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import { useHighlightWordToWordBank } from './useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';
import KeyListener from './KeyListener';
import VideoPlayer from './VideoPlayer';
import TranscriptItem from './TranscriptItem';
import useData from './useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from './srs-algo';
import ContentActionBar from './ContentActionBar';

const LearningScreen = ({
  ref,
  handlePlayFromHere,
  handleTimeUpdate,
  clearTopic,
  currentTime,
}) => {
  const [formattedTranscriptState, setFormattedTranscriptState] = useState();
  const [secondsState, setSecondsState] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const {
    pureWords,
    updateSentenceData,
    sentenceReviewBulk,
    breakdownSentence,
    updateContentMetaData,
    getNextTranscript,
    selectedContentState,
    checkIsThereFollowingContent,
  } = useData();

  const generalTopic = getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const realStartTime = selectedContentState.realStartTime;
  const contentIndex = selectedContentState.contentIndex;

  const nextReview = selectedContentState?.nextReview;
  const reviewHistory = selectedContentState?.reviewHistory;
  const hasContentToReview = content?.some(
    (sentenceWidget) => sentenceWidget?.reviewData,
  );

  const { underlineWordsInSentence } = useHighlightWordToWordBank({
    pureWordsUnique: pureWords,
  });

  useEffect(() => {
    if (!ref.current?.duration || secondsState?.length > 0) {
      return;
    }

    const arrOfSeconds = mapSentenceIdsToSeconds({
      content,
      duration: ref.current?.duration,
      isVideoModeState: true,
      realStartTime,
    });

    setSecondsState(arrOfSeconds);
  }, [ref.current, secondsState, content, realStartTime]);

  const isNumber = (value) => {
    return typeof value === 'number';
  };

  const masterPlay =
    currentTime &&
    secondsState?.length > 0 &&
    secondsState[Math.floor(currentTime)];

  const handlePause = () => ref.current.pause();

  const handleReviewFunc = async ({ sentenceId, isRemoveReview }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });

    try {
      await updateSentenceData({
        topicName: selectedContentState.title,
        sentenceId,
        fieldToUpdate: {
          reviewData: isRemoveReview ? null : nextScheduledOptions['1'].card,
        },
        contentIndex,
        isRemoveReview,
      });
    } catch (error) {
      console.log('## handleReviewFunc error', error);
    }
  };

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

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {
    await breakdownSentence({
      topicName: selectedContentState.title,
      sentenceId,
      language: japanese,
      targetLang,
      contentIndex,
    });
  };

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

  const getFormattedData = () => {
    const formattedTranscript = content.map((item) => {
      return {
        ...item,
        targetLangformatted: underlineWordsInSentence(item.targetLang),
      };
    });

    setFormattedTranscriptState(formattedTranscript);
  };
  useEffect(() => {
    getFormattedData();
  }, [pureWords, content]);

  if (!formattedTranscriptState) {
    return null;
  }

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = checkIsThereFollowingContent(
    selectedContentState.contentIndex,
    selectedContentState.generalTopicName,
  );

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

      <ContentActionBar
        handleBulkReviews={handleBulkReviews}
        hasContentToReview={hasContentToReview}
        updateContentMetaData={updateContentMetaData}
        topicName={selectedContentState.title}
        nextReview={nextReview}
        reviewHistory={reviewHistory}
        contentIndex={contentIndex}
      />
      <div
        style={{
          display: 'flex',
          gap: 20,
          width: 'fit-content',
          margin: 'auto',
          marginTop: 50,
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
            style={{
              margin: 'auto',
              maxWidth: 600,
            }}
          >
            <div>
              {hasPreviousVideo && (
                <button
                  className='m-auto flex p-2.5'
                  onClick={() => {
                    getNextTranscript();
                    setSecondsState();
                  }}
                >
                  ⏫⏫⏫⏫⏫
                </button>
              )}
              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  margin: 'auto',
                  overflow: 'scroll',
                  maxHeight: '600px',
                  overflowY: 'auto',
                }}
              >
                {formattedTranscriptState.map((contentItem, index) => {
                  return (
                    <TranscriptItem
                      key={index}
                      index={index}
                      contentItem={contentItem}
                      isVideoPlaying={isVideoPlaying}
                      handlePause={handlePause}
                      handleFromHere={handleFromHere}
                      masterPlay={masterPlay}
                      handleReviewFunc={handleReviewFunc}
                      handleBreakdownSentence={handleBreakdownSentence}
                    />
                  );
                })}
              </ul>
              <div>
                {hasFollowingVideo && (
                  <button
                    className='m-auto flex p-2.5'
                    onClick={() => {
                      getNextTranscript(true);
                      setSecondsState();
                    }}
                  >
                    ⏬⏬⏬⏬⏬
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningScreen;
