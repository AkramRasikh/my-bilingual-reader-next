'use client';
import { useEffect, useRef } from 'react';
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
  srsCalculationAndText,
  srsRetentionKeyTypes,
} from './srs-algo';
import ContentActionBar from './ContentActionBar';
import Transcript from './Transcript';
import { Button } from '@/components/ui/button';
import { Repeat2 } from 'lucide-react';
import clsx from 'clsx';
import ProgressBarSnippet from './ProgressBarSnippet';
import ComprehensiveTranscriptItem from './ComprehensiveTranscriptItem';
import useLearningScreen from './useLearningScreen';

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
    setIsPressDownShiftState,
    isInReviewMode,
    setIsInReviewMode,
    sentenceHighlightingState,
    setSentenceHighlightingState,
    isGenericItemLoadingState,
    setIsGenericItemLoadingState,
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
    handlePlayFromHere,
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
    updateSentenceData,
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

  const isNumber = (value) => {
    return typeof value === 'number';
  };

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

  const handleReviewFunc = async ({ sentenceId, isRemoveReview, nextDue }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });

    try {
      await updateSentenceData({
        topicName: isFullReview
          ? getThisSentenceInfo(sentenceId).title
          : selectedContentState.title,
        sentenceId,
        fieldToUpdate: {
          reviewData: isRemoveReview
            ? null
            : nextDue || nextScheduledOptions['1'].card,
        },
        contentIndex: isFullReview
          ? getThisSentenceInfo(sentenceId).contentIndex
          : contentIndex,
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

  const handleUpdateLoopedSentence = (extendSentenceLoop) => {
    if (extendSentenceLoop) {
      const lastSentenceId =
        loopTranscriptState[loopTranscriptState.length - 1]?.id;
      if (!lastSentenceId) {
        return;
      }
      const lastSentenceIdIndex = formattedTranscriptState.findIndex(
        (i) => i.id === lastSentenceId,
      );

      const thisItemData = formattedTranscriptState[lastSentenceIdIndex + 1];

      const nextElToAddToLoop = {
        ...thisItemData,
        time: realStartTime + thisItemData.time,
      };

      setLoopTranscriptState((prev) => [...prev, nextElToAddToLoop]);
    } else {
      setLoopTranscriptState((prev) => prev.slice(0, -1));
    }
  };

  const handleShiftLoopSentence = (shiftForward) => {
    if (shiftForward) {
      setLoopTranscriptState((prev) => prev.slice(1));
    }
  };

  const handleLoopThisSentence = () => {
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[Math.floor(ref.current.currentTime)];
    const thisIndex = formattedTranscriptState.findIndex(
      (item) => item.id === currentMasterPlay,
    );
    const masterItem = formattedTranscriptState[thisIndex];

    if (
      loopTranscriptState?.length === 1 &&
      loopTranscriptState[0]?.id === currentMasterPlay
    ) {
      setLoopTranscriptState(null);
      return;
    }

    setLoopTranscriptState([
      {
        ...masterItem,
        time: realStartTime + masterItem.time,
        nextTime:
          realStartTime +
          (thisIndex === formattedTranscriptState.length - 1
            ? ref.current.duration - 0.05
            : thisIndex === 0
            ? realStartTime
            : formattedTranscriptState[thisIndex - 1].time),
      },
    ]);
  };

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
  const handleLoopThis3Second = () => {
    if (loopTranscriptState) {
      setLoopTranscriptState(null);
    }
    if (isNumber(threeSecondLoopState)) {
      setThreeSecondLoopState(null);
      return;
    }

    setThreeSecondLoopState(ref.current.currentTime);
    // account for the three seconds on both extremes
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
    if (alreadyHasBreakdown) {
      handleOpenBreakdownSentence();
      return null;
    }

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

  const handleSlowDownAudio = (isSlow) => {
    if (isSlow) {
      ref.current.playbackRate = 0.75;
    } else {
      ref.current.playbackRate = 1;
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

  const handleAddMasterToReview = async () => {
    const currentSecond = Math.floor(ref.current.currentTime);
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[currentSecond]; // need to make sure its part of the content

    const sentenceHasReview =
      getThisSentenceInfo(currentMasterPlay)?.reviewData;

    try {
      setIsGenericItemLoadingState((prev) => [...prev, currentMasterPlay]);
      await handleReviewFunc({
        sentenceId: currentMasterPlay,
        isRemoveReview: Boolean(sentenceHasReview),
        nextDue: null,
      });
    } catch (error) {
      console.log('## handleAddMasterToReview', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
  };

  const handleIsEasyReviewShortCut = async () => {
    const currentSecond = Math.floor(ref.current.currentTime);
    const currentMasterPlay =
      isNumber(currentTime) &&
      secondsState?.length > 0 &&
      secondsState[currentSecond]; // need to make sure its part of the content

    const sentenceHasReview =
      getThisSentenceInfo(currentMasterPlay)?.reviewData;

    const { nextScheduledOptions } = srsCalculationAndText({
      reviewData: sentenceHasReview,
      contentType: srsRetentionKeyTypes.sentences,
      timeNow: new Date(),
    });

    const nextReviewData = nextScheduledOptions['4'].card;

    try {
      setIsGenericItemLoadingState((prev) => [...prev, currentMasterPlay]);
      await handleReviewFunc({
        sentenceId: currentMasterPlay,
        nextDue: nextReviewData,
      });
    } catch (error) {
      console.log('## handleAddMasterToReview', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
  };
  const handleShiftSnippet = (shiftNumber: number) => {
    if (isNumber(threeSecondLoopState) && threeSecondLoopState > 0) {
      // factor in small descrepancy
      const newCurrentNumber = threeSecondLoopState + shiftNumber;
      setThreeSecondLoopState(newCurrentNumber);
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
        isInReviewMode={isInReviewMode}
        setIsInReviewMode={setIsInReviewMode}
        onlyShowEngState={onlyShowEngState}
        setOnlyShowEngState={setOnlyShowEngState}
        showOnVideoTranscriptState={showOnVideoTranscriptState}
        setShowOnVideoTranscriptState={setShowOnVideoTranscriptState}
        setShowWordsBasketState={setShowWordsBasketState}
      />
      <div
        style={{
          display: 'flex',
          gap: 20,
          width: 'fit-content',
          margin: 'auto',
          marginTop: 20,
        }}
      >
        <div className='flex-1 mt-5 max-w-xl m-auto'>
          <VideoPlayer
            ref={ref}
            url={videoUrl}
            handleTimeUpdate={handleTimeUpdate}
            setIsVideoPlaying={setIsVideoPlaying}
            masterPlayComprehensiveState={
              showOnVideoTranscriptState && masterPlayComprehensiveState
            }
          />
          {threeSecondLoopState && (
            <div className='pt-1.5 m-auto flex justify-center gap-1.5 w-80'>
              <ProgressBarSnippet
                snippetRef={ref}
                threeSecondLoopState={threeSecondLoopState}
                progress={progress}
                setProgress={setProgress}
                contractThreeSecondLoopState={contractThreeSecondLoopState}
              />
              <Button
                id='stop-loop'
                onClick={() => setThreeSecondLoopState(null)}
                className={clsx(isVideoPlaying && 'animate-spin')}
                size='icon'
                variant={'destructive'}
              >
                <Repeat2 />
              </Button>
            </div>
          )}
          {masterPlayComprehensiveState && (
            <ComprehensiveTranscriptItem
              contentItem={masterPlayComprehensiveState}
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
            />
          )}
          <KeyListener
            isVideoPlaying={isVideoPlaying}
            handlePausePlay={handlePausePlay}
            handleJumpToSentenceViaKeys={handleJumpToSentenceViaKeys}
            handleRewind={handleRewind}
            handleBreakdownMasterSentence={handleBreakdownMasterSentence}
            handlePlayPauseViaRef={handlePlayPauseViaRef}
            setIsPressDownShiftState={setIsPressDownShiftState}
            handleLoopThisSentence={handleLoopThisSentence}
            handleLoopThis3Second={handleLoopThis3Second}
            threeSecondLoopState={threeSecondLoopState}
            handleShiftSnippet={handleShiftSnippet}
            handleSlowDownAudio={handleSlowDownAudio}
            loopTranscriptState={loopTranscriptState}
            handleAddMasterToReview={handleAddMasterToReview}
            handleUpdateLoopedSentence={handleUpdateLoopedSentence}
            handleShiftLoopSentence={handleShiftLoopSentence}
            handleIsEasyReviewShortCut={handleIsEasyReviewShortCut}
            isInReviewMode={isInReviewMode}
            setContractThreeSecondLoopState={setContractThreeSecondLoopState}
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
            isPressDownShiftState={isPressDownShiftState}
            loopTranscriptState={loopTranscriptState}
            setLoopTranscriptState={setLoopTranscriptState}
            overlappingSnippetDataState={overlappingSnippetDataState}
            threeSecondLoopState={threeSecondLoopState}
            isInReviewMode={isInReviewMode}
            addWordToBasket={addWordToBasket}
            wordsForSelectedTopic={wordsForSelectedTopic}
          />
        )}
      </div>
    </div>
  );
};

export default LearningScreen;
