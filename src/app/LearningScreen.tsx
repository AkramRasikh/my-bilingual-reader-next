'use client';
import { useEffect, useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';
import { useHighlightWordToWordBank } from './useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';
import KeyListener from './KeyListener';
import VideoPlayer from './VideoPlayer';
import useData from './useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from './srs-algo';
import ContentActionBar from './ContentActionBar';
import Transcript from './Transcript';

const LearningScreen = ({
  ref,
  handlePlayFromHere,
  handleTimeUpdate,
  currentTime,
}) => {
  const [formattedTranscriptState, setFormattedTranscriptState] = useState();
  const [secondsState, setSecondsState] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [sentenceHighlightingState, setSentenceHighlightingState] =
    useState('');
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );

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
  const handlePausePlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handlePlayPauseViaRef = () => {
    if (isVideoPlaying) {
      handlePause();
    } else {
      ref.current.play();
    }
  };

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

  const handleOpenBreakdownSentence = () => {
    const currentSecond = Math.floor(ref.current.currentTime);
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[currentSecond];

    if (!currentMasterPlay) return null;
    const thisSentence = formattedTranscriptState.find(
      (item) => item.id === currentMasterPlay,
    );

    const alreadyHasBreakdown = thisSentence?.sentenceStructure;
    if (!alreadyHasBreakdown) return null;

    const isOpen = breakdownSentencesArrState.includes(currentMasterPlay);

    if (isOpen) {
      const updatedList = breakdownSentencesArrState.filter(
        (i) => i !== currentMasterPlay,
      );
      setBreakdownSentencesArrState(updatedList);
    } else {
      const updatedList = [...breakdownSentencesArrState, currentMasterPlay];
      setBreakdownSentencesArrState(updatedList);
    }
  };

  const handleBreakdownMasterSentence = async () => {
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[Math.floor(ref.current.currentTime)];

    if (!currentMasterPlay) return null;
    const thisSentence = formattedTranscriptState.find(
      (item) => item.id === currentMasterPlay,
    );

    const alreadyHasBreakdown = thisSentence?.sentenceStructure;
    if (alreadyHasBreakdown) return null;

    const thisSentenceTargetLang = thisSentence.targetLang;
    try {
      setIsGenericItemLoadingState((prev) => [...prev, currentMasterPlay]);
      await breakdownSentence({
        topicName: selectedContentState.title,
        sentenceId: currentMasterPlay,
        language: japanese,
        targetLang: thisSentenceTargetLang,
        contentIndex,
      });
    } catch (error) {
      console.log('## handleBreakdownMasterSentence error', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
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

    if (thisSentenceIndex === -1) {
      return;
    }
    if (thisSentenceIndex === 0 && nextIndex === -1) {
      handleFromHere(formattedTranscriptState[thisSentenceIndex]?.time);
    } else {
      handleFromHere(
        formattedTranscriptState[thisSentenceIndex + nextIndex]?.time,
      );
    }
  };

  const handleRewind = () =>
    (ref.current.currentTime = ref.current.currentTime - 3);

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
            marginTop: '50px',
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
            handleOpenBreakdownSentence={handleOpenBreakdownSentence}
            handlePausePlay={handlePausePlay}
            handleJumpToSentenceViaKeys={handleJumpToSentenceViaKeys}
            handleRewind={handleRewind}
            handleBreakdownMasterSentence={handleBreakdownMasterSentence}
            handlePlayPauseViaRef={handlePlayPauseViaRef}
          />
        </div>
        {secondsState && (
          <Transcript
            hasPreviousVideo={hasPreviousVideo}
            hasFollowingVideo={hasFollowingVideo}
            getNextTranscript={getNextTranscript}
            setSecondsState={setSecondsState}
            formattedTranscriptState={formattedTranscriptState}
            isVideoPlaying={isVideoPlaying}
            handlePause={handlePause}
            handleFromHere={handleFromHere}
            masterPlay={masterPlay}
            handleReviewFunc={handleReviewFunc}
            handleBreakdownSentence={handleBreakdownSentence}
            sentenceHighlightingState={sentenceHighlightingState}
            setSentenceHighlightingState={setSentenceHighlightingState}
            isGenericItemLoadingState={isGenericItemLoadingState}
            breakdownSentencesArrState={breakdownSentencesArrState}
            setBreakdownSentencesArrState={setBreakdownSentencesArrState}
            handleOpenBreakdownSentence={handleOpenBreakdownSentence}
          />
        )}
      </div>
    </div>
  );
};

export default LearningScreen;
