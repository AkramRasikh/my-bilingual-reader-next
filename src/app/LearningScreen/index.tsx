'use client';
import { useEffect, useRef } from 'react';
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
import { isNumber } from '@/utils/is-number';
import LearningScreenLoopUI from './LearningScreenLoopUI';

const LearningScreen = () => {
  const hoverTimerMasterRef = useRef<NodeJS.Timeout | null>(null);

  const {
    formattedTranscriptState,
    setFormattedTranscriptState,
    secondsState,
    setSecondsState,
    masterPlayComprehensiveState,
    setMasterPlayComprehensiveState,
    isVideoPlaying,
    setIsVideoPlaying,
    isPressDownShiftState,
    isInReviewMode,
    setIsInReviewMode,
    sentenceHighlightingState,
    setSentenceHighlightingState,
    isGenericItemLoadingState,
    breakdownSentencesArrState,
    setBreakdownSentencesArrState,
    overlappingSnippetDataState,
    setOverlappingSnippetDataState,
    wordPopUpState,
    setWordPopUpState,
    loopTranscriptState,
    setLoopTranscriptState,
    threeSecondLoopState,
    setThreeSecondLoopState,
    progress,
    setProgress,
    ref,
    handleTimeUpdate,
    currentTime,
    onlyShowEngState,
    setOnlyShowEngState,
    showOnVideoTranscriptState,
    setShowOnVideoTranscriptState,
    setShowWordsBasketState,
    contractThreeSecondLoopState,
    setContractThreeSecondLoopState,
  } = useLearningScreen();

  const {
    pureWords,
    wordsState,
    sentenceReviewBulk,
    breakdownSentence,
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

  useEffect(() => {
    // can be split into two for efficiency but fine for now
    if (!ref.current) return;
    if (isNumber(threeSecondLoopState)) {
      //
      const startTime =
        threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
      const endTime =
        threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);
      const lessThan1500Seconds = ref.current.currentTime < startTime;
      const moreThan1500Seconds = ref.current.currentTime > endTime;
      if (lessThan1500Seconds || moreThan1500Seconds) {
        ref.current.currentTime = startTime;
        ref.current.play();
        return;
      }
      return;
    }
    if (ref.current && loopTranscriptState?.length > 0) {
      const loopTranscriptIds = loopTranscriptState.map((item) => item?.id);
      const firstLoopScript = loopTranscriptState[0];
      if (!loopTranscriptIds.includes(masterPlay)) {
        ref.current.currentTime = firstLoopScript.time;
        ref.current.play();
      }
    }
    if (contractThreeSecondLoopState && !threeSecondLoopState) {
      setContractThreeSecondLoopState(false);
    }
  }, [
    loopTranscriptState,
    ref,
    masterPlay,
    contractThreeSecondLoopState,
    threeSecondLoopState,
    progress,
  ]);

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

  useEffect(() => {
    if (isNumber(threeSecondLoopState)) {
      const startTime =
        threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
      const endTime =
        threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

      const results = [];

      formattedTranscriptState.forEach((item, index) => {
        const start = item.time + realStartTime;
        const end =
          index < formattedTranscriptState.length - 1
            ? formattedTranscriptState[index + 1].time + realStartTime
            : start;
        const duration = end - start;

        const overlapStart = Math.max(start, startTime);
        const overlapEnd = Math.min(end, endTime);

        if (overlapStart < overlapEnd) {
          const overlapDuration = overlapEnd - overlapStart;
          const percentageOverlap = (overlapDuration / duration) * 100;
          const startPoint = ((overlapStart - start) / duration) * 100;

          results.push({
            ...item,
            start,
            end,
            percentageOverlap: Number(percentageOverlap.toFixed(2)),
            startPoint: Number(startPoint.toFixed(2)),
          });
        }
      });

      if (results?.length > 0) {
        setOverlappingSnippetDataState(results);
      }
    }
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    realStartTime,
    formattedTranscriptState,
  ]);

  const handleMouseEnter = (text) => {
    hoverTimerMasterRef.current = setTimeout(() => {
      const wordsAmongstHighlightedText = wordsState?.filter((item) => {
        if (item.baseForm === text || item.surfaceForm === text) {
          return true;
        }
        return false;
      });

      setWordPopUpState(wordsAmongstHighlightedText);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerMasterRef.current) {
      clearTimeout(hoverTimerMasterRef.current); // Cancel if left early
      hoverTimerMasterRef.current = null;
    }
  };

  const getThisSentenceInfo = (sentenceId) =>
    formattedTranscriptState.find((item) => item.id === sentenceId);

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {
    await breakdownSentence({
      topicName: isFullReview
        ? getThisSentenceInfo(sentenceId).title
        : selectedContentState.title,
      sentenceId,
      language: japanese,
      targetLang,
      contentIndex: isFullReview
        ? getThisSentenceInfo(sentenceId).contentIndex
        : contentIndex,
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
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
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
            formattedTranscriptState={formattedTranscriptState}
            isVideoPlaying={isVideoPlaying}
            masterPlay={masterPlay}
            handleBreakdownSentence={handleBreakdownSentence}
            sentenceHighlightingState={sentenceHighlightingState}
            setSentenceHighlightingState={setSentenceHighlightingState}
            isGenericItemLoadingState={isGenericItemLoadingState}
            breakdownSentencesArrState={breakdownSentencesArrState}
            setBreakdownSentencesArrState={setBreakdownSentencesArrState}
            handleOpenBreakdownSentence={handleOpenBreakdownSentence}
            isPressDownShiftState={isPressDownShiftState}
            loopTranscriptState={loopTranscriptState}
            setLoopTranscriptState={setLoopTranscriptState}
            overlappingSnippetDataState={overlappingSnippetDataState}
            threeSecondLoopState={threeSecondLoopState}
            isInReviewMode={isInReviewMode}
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
    </div>
  );
};

export default LearningScreen;
