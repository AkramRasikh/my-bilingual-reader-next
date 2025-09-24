'use client';
import { isNumber } from '@/utils/is-number';
import { createContext, useState } from 'react';
import useData from '../useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsCalculationAndText,
  srsRetentionKeyTypes,
} from '../srs-algo';

export const LearningScreenContext = createContext(null);

export const LearningScreenProvider = ({
  handlePlayFromHere,
  handleTimeUpdate,
  ref,
  currentTime,
  children,
}: PropsWithChildren<object>) => {
  const [formattedTranscriptState, setFormattedTranscriptState] = useState();
  const [secondsState, setSecondsState] = useState([]);
  const [masterPlayComprehensiveState, setMasterPlayComprehensiveState] =
    useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPressDownShiftState, setIsPressDownShiftState] = useState(false);
  const [isInReviewMode, setIsInReviewMode] = useState(false);
  const [onlyShowEngState, setOnlyShowEngState] = useState(false);
  const [showWordsBasketState, setShowWordsBasketState] = useState(false);
  const [showOnVideoTranscriptState, setShowOnVideoTranscriptState] =
    useState(true);
  const [sentenceHighlightingState, setSentenceHighlightingState] =
    useState('');
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );
  const [overlappingSnippetDataState, setOverlappingSnippetDataState] =
    useState([]);
  const [wordPopUpState, setWordPopUpState] = useState([]);

  const [loopTranscriptState, setLoopTranscriptState] = useState();
  const [threeSecondLoopState, setThreeSecondLoopState] = useState<
    number | null
  >();
  const [progress, setProgress] = useState(0);
  const [contractThreeSecondLoopState, setContractThreeSecondLoopState] =
    useState(false);

  const { selectedContentState, updateSentenceData } = useData();

  const realStartTime = selectedContentState?.realStartTime || 0;

  const handleFromHere = (time) => {
    if (!isNumber(time)) {
      return null;
    }

    const thisStartTime = realStartTime + time;

    handlePlayFromHere(thisStartTime);
  };
  const handlePause = () => ref.current.pause();

  const handleRewind = () =>
    (ref.current.currentTime = ref.current.currentTime - 3);

  const masterPlay =
    currentTime &&
    secondsState?.length > 0 &&
    secondsState[Math.floor(currentTime)];

  const handleJumpToSentenceViaKeys = (nextIndex: number) => {
    // defo revisit this

    const thisSentenceIndex = formattedTranscriptState.findIndex(
      (item) => item.id === masterPlay,
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

  const handleReviewFunc = async ({ sentenceId, isRemoveReview, nextDue }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });
    const isFullReview = selectedContentState?.isFullReview;
    const contentIndex = selectedContentState?.contentIndex;

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

  const getThisSentenceInfo = (sentenceId) =>
    formattedTranscriptState.find((item) => item.id === sentenceId);

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
      console.log('## handleIsEasyReviewShortCut', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
  };

  return (
    <LearningScreenContext.Provider
      value={{
        handlePlayFromHere,
        handleTimeUpdate,
        ref,
        currentTime,
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
        onlyShowEngState,
        setOnlyShowEngState,
        showOnVideoTranscriptState,
        setShowOnVideoTranscriptState,
        showWordsBasketState,
        setShowWordsBasketState,
        contractThreeSecondLoopState,
        setContractThreeSecondLoopState,
        masterPlay,
        handleFromHere,
        handlePause,
        handleRewind,
        handleJumpToSentenceViaKeys,
        handleLoopThis3Second,
        handleShiftLoopSentence,
        handleLoopThisSentence,
        handleUpdateLoopedSentence,
        handleBreakdownMasterSentence,
        handleAddMasterToReview,
        handleIsEasyReviewShortCut,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
