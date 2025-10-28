'use client';
import { isNumber } from '@/utils/is-number';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import useData from '../Providers/useData';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsCalculationAndText,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import useManageThreeSecondLoop from './hooks/useManageThreeSecondLoop';
import useManageLoopInit from './hooks/useManageLoopInit';
import useMapTranscriptToSeconds from './hooks/useMapTranscriptToSeconds';
import useTrackMasterTranscript from './hooks/useTrackMasterTranscript';
import { isDueCheck } from '@/utils/is-due-check';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { findAllInstancesOfWordsInSentence } from '@/utils/find-all-instances-of-words-in-sentences';

export const LearningScreenContext = createContext(null);

// type time

export const LearningScreenProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [secondsState, setSecondsState] = useState([]);
  const [loopSecondsState, setLoopSecondsState] = useState([]);
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
  const [latestDueIdState, setLatestDueIdState] = useState({
    id: '',
    triggerScroll: false,
  });
  const [
    generalTopicDisplayNameSelectedState,
    setGeneralTopicDisplayNameSelectedState,
  ] = useState('');
  const [scrollToElState, setScrollToElState] = useState('');
  const [sentenceRepsState, setSentenceRepsState] = useState(0);
  const [studyFromHereTimeState, setStudyFromHereTimeState] = useState(null);
  const [selectedContentTitleState, setSelectedContentTitleState] =
    useState('');
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [isBreakingDownSentenceArrState, setIsBreakingDownSentenceArrState] =
    useState([]);
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );
  const [overlappingSnippetDataState, setOverlappingSnippetDataState] =
    useState([]);

  const [loopTranscriptState, setLoopTranscriptState] = useState([]);
  const [threeSecondLoopState, setThreeSecondLoopState] = useState<
    number | null
  >();
  const [progress, setProgress] = useState(0);
  const [contractThreeSecondLoopState, setContractThreeSecondLoopState] =
    useState(false);

  const [
    numberOfSentencesPendingOrDueState,
    setNumberOfSentencesPendingOrDueState,
  ] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const {
    contentState,
    updateSentenceData,
    sentenceReviewBulk,
    pureWordsMemoized,
    breakdownSentence,
    wordsState,
  } = useData();

  const selectedContentStateMemoized = useMemo(() => {
    if (!selectedContentTitleState) {
      return null;
    }

    const thisContent = contentState.find(
      (item) => item?.title === selectedContentTitleState,
    );
    if (thisContent) {
      return thisContent;
    }
    return null;
  }, [contentState, selectedContentTitleState]);

  const realStartTime = selectedContentStateMemoized?.realStartTime || 0;

  const masterPlay =
    currentTime && loopSecondsState.length > 0
      ? loopSecondsState[Math.floor(currentTime)]
      : secondsState?.length > 0
      ? secondsState[Math.floor(currentTime)]
      : '';

  const content = selectedContentStateMemoized?.content;

  const {
    latestDueIdMemoized,
    firstDueIndexMemoized,
    formattedTranscriptMemoized,
  } = useMemo(() => {
    if (!content) {
      return {
        firstDueIndexMemoized: 0,
        latestDueIdMemoized: { id: '', triggerScroll: false },
        formattedTranscriptMemoized: [],
      };
    }
    const now = new Date();
    let latestIsDueEl = '';
    let latestIsDueElIndex;
    let firstDueIndexMemoized;

    const formattedTranscript = content.map((item, index) => {
      if (item?.reviewData && isDueCheck(item, now)) {
        latestIsDueEl = item.id;
        latestIsDueElIndex = index;
        if (!isNumber(firstDueIndexMemoized)) {
          firstDueIndexMemoized = index;
          if (firstDueIndexMemoized > 0) {
            firstDueIndexMemoized = firstDueIndexMemoized - 1;
          }
        }
      }

      const hasBeenReviewed = item?.reviewData?.due;
      const isDueNow = new Date(hasBeenReviewed) < now;

      const dueStatus = !hasBeenReviewed ? '' : isDueNow ? 'now' : 'pending';

      const targetLangformatted = underlineWordsInSentence(
        item.targetLang,
        pureWordsMemoized,
      );
      const wordsFromSentence = findAllInstancesOfWordsInSentence(
        item.targetLang,
        wordsState,
      );
      return {
        ...item,
        dueStatus,
        targetLangformatted,
        wordsFromSentence,
      };
    });

    const formattedTranscriptMemoized = formattedTranscript.map(
      (item, index, arr) => {
        if (index > 0 && arr[index + 1]?.dueStatus === 'now') {
          return { ...item, helperReviewSentence: true };
        }
        return item;
      },
    );

    const latestDueIdMemoized = {
      id: latestIsDueEl || '',
      index: latestIsDueElIndex,
      triggerScroll: false,
    };

    return {
      latestDueIdMemoized,
      firstDueIndexMemoized,
      formattedTranscriptMemoized,
    };
  }, [pureWordsMemoized, content]);

  const handlePlayFromHere = (time: number) => {
    if (ref.current) {
      ref.current.currentTime = time;
      ref.current.play();
    }
  };

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  const getFormattedData = () => {
    const now = new Date();
    let latestIsDueEl = '';
    let latestIsDueElIndex;

    content.forEach((item, index) => {
      if (item?.reviewData && isDueCheck(item, now)) {
        latestIsDueEl = item.id;
        latestIsDueElIndex = index;
      }
    });

    setLatestDueIdState({
      id: latestIsDueEl,
      index: latestIsDueElIndex,
      triggerScroll: false,
    });
  };

  const handleStudyFromHere = () => {
    const masterPlayIndex = formattedTranscriptMemoized.findIndex(
      (item) => item.id === masterPlay,
    );
    setStudyFromHereTimeState(masterPlayIndex);
    if (transcriptRef.current) {
      transcriptRef.current.scrollIntoView();
    }
  };

  const getNextTranscript = (isNext) => {
    const nextIndex =
      selectedContentStateMemoized.contentIndex + (isNext ? +1 : -1);

    const thisContentTitle = contentState.find(
      (item) => item?.title === contentState[nextIndex]?.title,
    )?.title;
    setSelectedContentTitleState(thisContentTitle);
  };

  const getGeneralContentMetaData = () => {
    if (!generalTopicDisplayNameSelectedState) {
      return null;
    }

    const todayDateObj = new Date();

    const contentOfGeneralTopic = contentState.filter(
      (contentEl) =>
        contentEl.generalTopicName === generalTopicDisplayNameSelectedState,
    );
    let numberOfPendingDue = 0;

    const contentOfGenTopic = contentOfGeneralTopic.map((thisContentEl) => {
      const title = thisContentEl.title;
      const reviewHistory = thisContentEl.reviewHistory?.length > 0;
      const chapter = title.split('-');
      const chapterNum = chapter[chapter.length - 1];

      let sentencesNeedReview = 0;
      const transcript = thisContentEl.content;

      const dueOrPending = transcript.filter(
        (item) => item.reviewData?.due,
      ).length;
      numberOfPendingDue = numberOfPendingDue + dueOrPending;
      sentencesNeedReview = transcript.filter((transcriptEl) => {
        if (!transcriptEl?.reviewData?.due) {
          return;
        }
        if (isDueCheck(transcriptEl, todayDateObj)) {
          return true;
        }
      }).length;
      return {
        chapterNum,
        hasBeenReviewed: reviewHistory,
        sentencesNeedReview,
        title,
        isSelected: selectedContentStateMemoized.title === title,
        dueOrPending,
      };
    });

    setNumberOfSentencesPendingOrDueState(numberOfPendingDue);
    return contentOfGenTopic;
  };

  const getSelectedTopicsWordsFunc = (content, isDueBool = false) => {
    const todayDateObj = new Date();
    const thisTopicsSentenceIds = content.map((i) => i.id);

    const thisTopicsWordsArr = [];

    wordsState.forEach((word) => {
      const originalContextId = word.contexts[0];
      if (thisTopicsSentenceIds.includes(originalContextId)) {
        if (!isDueBool) {
          thisTopicsWordsArr.push(word);
          return;
        }
        if (isDueCheck(word, todayDateObj)) {
          thisTopicsWordsArr.push(word);
        }
      }
    });

    return thisTopicsWordsArr;
  };

  const getGeneralContentWordData = () => {
    if (!generalTopicDisplayNameSelectedState) {
      return null;
    }

    const contentOfGeneralTopic = contentState.filter(
      (contentEl) =>
        contentEl.generalTopicName === generalTopicDisplayNameSelectedState,
    );

    const allContentDueWords = contentOfGeneralTopic.map((i) =>
      getSelectedTopicsWordsFunc(i.content, true),
    );

    return allContentDueWords;
  };

  const checkHowManyOfTopicNeedsReview = () => {
    if (!generalTopicDisplayNameSelectedState) {
      return null;
    }

    const todayDateObj = new Date();

    const sentencesNeedReview = [];
    contentState.forEach((contentEl) => {
      if (contentEl.generalTopicName !== generalTopicDisplayNameSelectedState) {
        return;
      }

      const thisStartTime = contentEl.realStartTime;
      const contentIndex = contentEl.contentIndex;
      const transcript = contentEl.content;
      const generalTopicName = contentEl.generalTopicName;
      const title = contentEl.title;

      transcript.forEach((transcriptEl) => {
        if (!transcriptEl?.reviewData?.due) {
          return;
        }
        if (isDueCheck(transcriptEl, todayDateObj)) {
          sentencesNeedReview.push({
            ...transcriptEl,
            time: thisStartTime + transcriptEl.time,
            contentIndex,
            title,
            generalTopicName,
          });
        }
      });
    });

    return sentencesNeedReview;
  };

  const handleSelectedContent = (thisYoutubeTitle) => {
    setSelectedContentTitleState(thisYoutubeTitle);
  };

  useEffect(() => {
    if (content) {
      getFormattedData();
    }
  }, [pureWordsMemoized, content]);

  useEffect(() => {
    if (isInReviewMode) {
      setStudyFromHereTimeState(null);
    }
  }, [isInReviewMode, studyFromHereTimeState]);

  useManageThreeSecondLoop({
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState: formattedTranscriptMemoized,
    realStartTime,
    setOverlappingSnippetDataState,
    overlappingSnippetDataState,
  });

  useManageLoopInit({
    ref,
    threeSecondLoopState,
    contractThreeSecondLoopState,
    loopTranscriptState,
    setContractThreeSecondLoopState,
    masterPlay,
    progress,
  });

  useMapTranscriptToSeconds({
    ref,
    content,
    realStartTime,
    secondsState,
    setSecondsState,
    setLoopSecondsState,
    loopTranscriptState,
  });

  useTrackMasterTranscript({
    masterPlay,
    formattedTranscriptState: formattedTranscriptMemoized,
    setMasterPlayComprehensiveState,
  });

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

  const playFromThisContext = (contextId) => {
    const contextSentence = formattedTranscriptMemoized.find(
      (item) => item.id === contextId,
    );
    if (contextSentence) {
      handleFromHere(contextSentence.time);
    }
  };

  const handleJumpToSentenceViaKeys = (nextIndex: number) => {
    // defo revisit this

    const thisSentenceIndex = formattedTranscriptMemoized.findIndex(
      (item) => item.id === masterPlay,
    );

    if (thisSentenceIndex === -1) {
      return;
    }
    if (thisSentenceIndex === 0 && nextIndex === -1) {
      handleFromHere(formattedTranscriptMemoized[thisSentenceIndex]?.time);
    } else {
      handleFromHere(
        formattedTranscriptMemoized[thisSentenceIndex + nextIndex]?.time,
      );
    }
  };

  const handleScrollToMasterView = () => {
    setScrollToElState(masterPlay);
    setTimeout(() => setScrollToElState(''), 300);
  };

  const wordsForSelectedTopicMemoized = useMemo(() => {
    if (selectedContentStateMemoized && wordsState?.length > 0) {
      const dateNow = new Date();
      const wordsForThisTopic = getSelectedTopicsWordsFunc(
        selectedContentStateMemoized.content,
      );
      const sortedWordsForThisTopic = wordsForThisTopic?.sort(
        (a, b) => isDueCheck(b, dateNow) - isDueCheck(a, dateNow),
      );
      return sortedWordsForThisTopic;
    }

    return [];
  }, [getSelectedTopicsWordsFunc, wordsState, selectedContentStateMemoized]);

  const handleBulkReviews = async () => {
    const emptyCard = getEmptyCard();

    const sentenceIdData =
      loopTranscriptState.filter((item) => !item?.reviewData) || [];

    const nextScheduledOptions = getNextScheduledOptions({
      card: emptyCard,
      contentType: srsRetentionKeyTypes.sentences,
    });

    const contentIndex = selectedContentStateMemoized?.contentIndex;
    const hasContentToReview = content?.some(
      (sentenceWidget) => sentenceWidget?.reviewData,
    );

    const nextDueCard = nextScheduledOptions['2'].card;

    if (sentenceIdData.length === 0) {
      console.log('## no sentenceIds');
      return;
    }

    const sentenceIds = sentenceIdData.map((item) => item.id);

    try {
      setIsGenericItemLoadingState((prev) => [...prev, ...sentenceIds]);
      await sentenceReviewBulk({
        topicName: selectedContentStateMemoized.title,
        fieldToUpdate: {
          reviewData: nextDueCard,
        },
        contentIndex: contentIndex,
        removeReview: hasContentToReview,
        sentenceIds,
      });
      setSentenceRepsState((prev) => prev + sentenceIds.length);
    } catch (error) {
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => !sentenceIds.includes(item)),
      );
    }
  };

  const handleReviewFunc = async ({ sentenceId, isRemoveReview, nextDue }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });
    const isFullReview = selectedContentStateMemoized?.isFullReview;
    const contentIndex = selectedContentStateMemoized?.contentIndex;

    try {
      await updateSentenceData({
        topicName: isFullReview
          ? getThisSentenceInfo(sentenceId).title
          : selectedContentStateMemoized.title,
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
      setSentenceRepsState(sentenceRepsState + 1);
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
    const thisIndex = formattedTranscriptMemoized.findIndex(
      (item) => item.id === currentMasterPlay,
    );
    const masterItem = formattedTranscriptMemoized[thisIndex];

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
          (thisIndex === formattedTranscriptMemoized.length - 1
            ? ref.current.duration - 0.05
            : thisIndex === 0
            ? realStartTime
            : formattedTranscriptMemoized[thisIndex - 1].time),
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
      const lastSentenceIdIndex = formattedTranscriptMemoized.findIndex(
        (i) => i.id === lastSentenceId,
      );

      const thisItemData = formattedTranscriptMemoized[lastSentenceIdIndex + 1];

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
    const thisSentence = formattedTranscriptMemoized.find(
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
    const thisSentence = formattedTranscriptMemoized.find(
      (item) => item.id === currentMasterPlay,
    );

    const alreadyHasBreakdown = thisSentence?.sentenceStructure;
    if (alreadyHasBreakdown) {
      handleOpenBreakdownSentence();
      return null;
    }

    const thisSentenceTargetLang = thisSentence.targetLang;
    const contentIndex = selectedContentStateMemoized?.contentIndex;

    try {
      setIsBreakingDownSentenceArrState((prev) => [...prev, currentMasterPlay]);
      await breakdownSentence({
        topicName: selectedContentStateMemoized.title,
        sentenceId: currentMasterPlay,
        targetLang: thisSentenceTargetLang,
        contentIndex,
      });
    } catch (error) {
      console.log('## handleBreakdownMasterSentence error', error);
    } finally {
      setIsBreakingDownSentenceArrState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
  };

  const getThisSentenceInfo = (sentenceId) =>
    formattedTranscriptMemoized.find((item) => item.id === sentenceId);

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
      setSentenceRepsState(sentenceRepsState + 1);
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
      setSentenceRepsState(sentenceRepsState + 1);
    } catch (error) {
      console.log('## handleIsEasyReviewShortCut', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== currentMasterPlay),
      );
    }
  };

  const handleSelectInitialTopic = (youtubeTag) => {
    const firstElOfYoutubeTitle = contentState.find(
      (i) => i.generalTopicName === youtubeTag,
    );
    setGeneralTopicDisplayNameSelectedState(youtubeTag);
    handleSelectedContent(firstElOfYoutubeTitle.title);
  };

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {
    const contentIndex = selectedContentState?.contentIndex;
    await breakdownSentence({
      topicName: selectedContentState.title,
      sentenceId,
      targetLang,
      contentIndex,
    });
  };

  const handleOnHome = () => {
    setGeneralTopicDisplayNameSelectedState('');
    setSecondsState([]);
    setIsInReviewMode(false);
    setStudyFromHereTimeState(null);
    setSelectedContentTitleState('');
  };

  const contentMetaMemoized = useMemo(() => {
    if (!generalTopicDisplayNameSelectedState) return null;
    return getGeneralContentMetaData();
  }, [
    generalTopicDisplayNameSelectedState,
    wordsState,
    selectedContentStateMemoized,
  ]);

  const contentMetaWordMemoized = useMemo(() => {
    if (!generalTopicDisplayNameSelectedState) return null;
    return getGeneralContentWordData();
  }, [
    generalTopicDisplayNameSelectedState,
    wordsState,
    selectedContentStateMemoized,
  ]);

  return (
    <LearningScreenContext.Provider
      value={{
        handlePlayFromHere,
        handleTimeUpdate,
        ref,
        currentTime,
        formattedTranscriptState: formattedTranscriptMemoized,
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
        handleBulkReviews,
        handleReviewFunc,
        handleBreakdownSentence,
        isBreakingDownSentenceArrState,
        latestDueIdState,
        setLatestDueIdState,
        firstDueIndexMemoized,
        handleStudyFromHere,
        setStudyFromHereTimeState,
        studyFromHereTimeState,
        transcriptRef,
        handleScrollToMasterView,
        scrollToElState,
        handleSelectedContent,
        getNextTranscript,
        handleSelectInitialTopic,
        generalTopicDisplayNameSelectedState,
        setGeneralTopicDisplayNameSelectedState,
        checkHowManyOfTopicNeedsReview,
        getGeneralContentMetaData,
        getGeneralContentWordData,
        wordsForSelectedTopic: wordsForSelectedTopicMemoized,
        selectedContentState: selectedContentStateMemoized,
        handleOnHome,
        sentenceRepsState,
        elapsed,
        setElapsed,
        playFromThisContext,
        numberOfSentencesPendingOrDueState,
        setSentenceRepsState,
        contentMetaMemoized,
        contentMetaWordMemoized,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
