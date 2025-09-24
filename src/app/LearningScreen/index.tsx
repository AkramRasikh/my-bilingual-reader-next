'use client';
import { useEffect } from 'react';
import { getFirebaseVideoURL } from '../get-firebase-media-url';
import { getGeneralTopicName } from '../get-general-topic-name';
import { japanese } from '../languages';
import { useHighlightWordToWordBank } from '../useHighlightWordToWordBank';
import { mapSentenceIdsToSeconds } from '../map-sentence-ids-to-seconds';
import KeyListener from '../KeyListener';
import VideoPlayer from '../VideoPlayer';
import useData from '../useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-algo';
import ContentActionBar from '../ContentActionBar';
import ComprehensiveTranscriptItem from '../ComprehensiveTranscriptItem';
import useLearningScreen from './useLearningScreen';
import { ContentSectionsForReciew } from '../ContentSelection';
import LearningScreenContentContainer from './LearningScreenContentContainer';
import LearningScreenLoopUI from './LearningScreenLoopUI';

const LearningScreen = () => {
  const {
    formattedTranscriptState,
    setFormattedTranscriptState,
    secondsState,
    setSecondsState,
    masterPlayComprehensiveState,
    setMasterPlayComprehensiveState,
    setIsVideoPlaying,
    isInReviewMode,
    setIsInReviewMode,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    currentTime,
    onlyShowEngState,
    setOnlyShowEngState,
    showOnVideoTranscriptState,
    setShowOnVideoTranscriptState,
    setShowWordsBasketState,
  } = useLearningScreen();

  const {
    pureWords,
    sentenceReviewBulk,
    updateContentMetaData,
    getNextTranscript,
    selectedContentState,
    checkIsThereFollowingContent,
    wordsForSelectedTopic,
    wordBasketState,
    setWordBasketState,
  } = useData();

  const addWordToBasket = (word) => {
    const wordIsInBasic = wordBasketState.some(
      (wordItem) => wordItem?.id === word.id,
    );

    if (wordIsInBasic) {
      const updatedBasket = wordBasketState.filter(
        (item) => item.id !== word.id,
      );
      setWordBasketState(updatedBasket);
      return;
    }

    setWordBasketState((prev) => [...prev, word]);
  };

  const isFullReview = selectedContentState?.isFullReview;

  const generalTopic = isFullReview
    ? selectedContentState.title
    : getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  const realStartTime = selectedContentState?.realStartTime || 0;
  const contentIndex = selectedContentState?.contentIndex;

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

  const masterPlay =
    currentTime &&
    secondsState?.length > 0 &&
    secondsState[Math.floor(currentTime)];

  useEffect(() => {
    if (masterPlay && formattedTranscriptState) {
      const thisItemTranscript = formattedTranscriptState.find(
        (item) => item.id === masterPlay,
      );
      setMasterPlayComprehensiveState(thisItemTranscript);
    }
  }, [masterPlay, formattedTranscriptState]);

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
    <div
      style={{
        display: 'flex',
        gap: 20,
        width: 'fit-content',
        margin: 'auto',
        marginTop: 20,
      }}
    >
      <ContentSectionsForReciew />
      <div className='flex-1 max-w-xl mx-auto'>
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          handleTimeUpdate={handleTimeUpdate}
          setIsVideoPlaying={setIsVideoPlaying}
          masterPlayComprehensiveState={
            showOnVideoTranscriptState && masterPlayComprehensiveState
          }
        />
        <ContentActionBar
          nextReview={nextReview}
          isInReviewMode={isInReviewMode}
          setIsInReviewMode={setIsInReviewMode}
          onlyShowEngState={onlyShowEngState}
          setOnlyShowEngState={setOnlyShowEngState}
          showOnVideoTranscriptState={showOnVideoTranscriptState}
          setShowOnVideoTranscriptState={setShowOnVideoTranscriptState}
          setShowWordsBasketState={setShowWordsBasketState}
          ref={ref}
        />

        {threeSecondLoopState && <LearningScreenLoopUI />}
        {masterPlayComprehensiveState && (
          <ComprehensiveTranscriptItem
            contentItem={masterPlayComprehensiveState}
          />
        )}
        <KeyListener />
      </div>
      {secondsState && (
        <LearningScreenContentContainer
          hasPreviousVideo={hasPreviousVideo}
          hasFollowingVideo={hasFollowingVideo}
          getNextTranscript={getNextTranscript}
          setSecondsState={setSecondsState}
          addWordToBasket={addWordToBasket}
          wordsForSelectedTopic={wordsForSelectedTopic}
          hasContentToReview={hasContentToReview}
          handleBulkReviews={handleBulkReviews}
          reviewHistory={reviewHistory}
          updateContentMetaData={updateContentMetaData}
          topicName={!isFullReview && selectedContentState?.title}
          contentIndex={contentIndex}
        />
      )}
    </div>
  );
};

export default LearningScreen;
