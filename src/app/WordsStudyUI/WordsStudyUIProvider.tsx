'use client';
import { isNumber } from '@/utils/is-number';
import { createContext, useEffect, useRef, useState, useContext } from 'react';
import useData from '../Providers/useData';
import useTrackMasterTranscript from '../LearningScreen/hooks/useManageThreeSecondLoop';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { useFetchData } from '../Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/find-all-instances-of-words-in-sentences';

const WordsStudyUIContext = createContext(null);

export const WordsStudyUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const transcriptRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [formattedTranscriptState, setFormattedTranscriptState] = useState([]);
  const [secondsState, setSecondsState] = useState([]);
  const [loopSecondsState, setLoopSecondsState] = useState([]);
  const [masterPlayComprehensiveState, setMasterPlayComprehensiveState] =
    useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPressDownShiftState, setIsPressDownShiftState] = useState(false);
  const [selectedElState, setSelectedElState] = useState(0);
  const [isInReviewMode, setIsInReviewMode] = useState(false);
  const [onlyShowEngState, setOnlyShowEngState] = useState(false);
  const [showWordsBasketState, setShowWordsBasketState] = useState(false);
  const [showOnVideoTranscriptState, setShowOnVideoTranscriptState] =
    useState(true);
  const [sentenceHighlightingState, setSentenceHighlightingState] =
    useState('');
  const [sentenceRepsState, setSentenceRepsState] = useState(0);
  const [studyFromHereTimeState, setStudyFromHereTimeState] = useState(null);
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [isBreakingDownSentenceArrState, setIsBreakingDownSentenceArrState] =
    useState([]);
  const [formattedWordsStudyState, setFormattedWordsStudyState] = useState([]);
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );
  const [overlappingSnippetDataState, setOverlappingSnippetDataState] =
    useState([]);

  const [loopTranscriptState, setLoopTranscriptState] = useState([]);
  const [selectedContentState, setSelectedContentState] = useState();
  const [threeSecondLoopState, setThreeSecondLoopState] = useState<
    number | null
  >();
  const [progress, setProgress] = useState(0);
  const [contractThreeSecondLoopState, setContractThreeSecondLoopState] =
    useState(false);

  const [elapsed, setElapsed] = useState(0);
  const {
    contentState,
    pureWordsState,
    breakdownSentence,
    wordsState,
    wordsForReviewState,
  } = useData();

  const { data } = useFetchData();

  const sentencesData = data.sentencesData;

  useEffect(() => {
    const slicedWords = wordsForReviewState.slice(0, 6);
    const wordsDataWithContextData = slicedWords.map((item) => {
      let contextIds = item.contexts;

      const isNumericKeyObject =
        typeof contextIds === 'object' &&
        contextIds !== null &&
        !Array.isArray(contextIds) &&
        Object.keys(contextIds).every((key) => !isNaN(Number(key)));

      if (isNumericKeyObject) {
        contextIds = Object.values(contextIds);
      }
      const contextData = [];

      for (const contextId of contextIds ?? []) {
        for (const contentItem of contentState) {
          const thisContent = contentItem.content;

          const contextSentenceDataIndex = thisContent.findIndex(
            (contentSentence) => contentSentence.id === contextId,
          );

          const contextSentenceData = thisContent[contextSentenceDataIndex];

          if (contextSentenceData) {
            const previousSentence =
              contextSentenceDataIndex > 0
                ? {
                    ...thisContent[contextSentenceDataIndex - 1],
                    targetLangformatted: underlineWordsInSentence(
                      thisContent[contextSentenceDataIndex - 1].targetLang,
                      pureWordsState,
                    ),
                  }
                : null;

            const nextSentence =
              contextSentenceDataIndex + 1 < thisContent.length
                ? {
                    ...thisContent[contextSentenceDataIndex + 1],
                    targetLangformatted: underlineWordsInSentence(
                      thisContent[contextSentenceDataIndex + 1].targetLang,
                      pureWordsState,
                    ),
                  }
                : null;

            const totalObj = {
              ...contextSentenceData,
              title: contentItem?.title,
              generalTopicName: contentItem?.generalTopicName,
              isMedia: contentItem?.origin === 'youtube',
              targetLangformatted: underlineWordsInSentence(
                contextSentenceData.targetLang,
                pureWordsState,
              ),
              contentIndex: contentItem.contentIndex,
              realStartTime: contentItem?.realStartTime,
              wordsFromSentence: findAllInstancesOfWordsInSentence(
                contextSentenceData.targetLang,
                wordsState,
              ),
              ...(previousSentence && { previousSentence }),
              ...(nextSentence && { nextSentence }),
            };

            contextData.push(totalObj);

            // Break inner loop since we found a match
            break;
          } else {
            const foundContextIdInAdhocSentences = sentencesData.find(
              (sentenceItem) => sentenceItem.id === contextId,
            );

            if (foundContextIdInAdhocSentences) {
              contextData.push({
                ...foundContextIdInAdhocSentences,
                isAdhoc: true,
                wordsFromSentence: findAllInstancesOfWordsInSentence(
                  foundContextIdInAdhocSentences.targetLang,
                  wordsState,
                ),
              });
              break;
            }
          }
        }
      }

      return {
        ...item,
        contextData,
      };
    });

    setFormattedWordsStudyState(wordsDataWithContextData);
  }, [wordsForReviewState]);

  const realStartTime = selectedContentState?.realStartTime || 0;

  const masterPlay =
    currentTime && loopSecondsState.length > 0
      ? loopSecondsState[Math.floor(currentTime)]
      : secondsState?.length > 0
      ? secondsState[Math.floor(currentTime)]
      : '';

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

  useTrackMasterTranscript({
    masterPlay,
    formattedTranscriptState,
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
    const contextSentence = formattedTranscriptState.find(
      (item) => item.id === contextId,
    );
    if (contextSentence) {
      handleFromHere(contextSentence.time);
    }
  };

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

  const handleLoopThis3Second = () => {
    // if (loopTranscriptState) {
    //   setLoopTranscriptState(null);
    // }
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
    const contentIndex = selectedContentState?.contentIndex;

    try {
      setIsBreakingDownSentenceArrState((prev) => [...prev, currentMasterPlay]);
      await breakdownSentence({
        topicName: selectedContentState.title,
        sentenceId: currentMasterPlay,
        language: 'japanese',
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

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {
    const contentIndex = selectedContentState?.contentIndex;
    await breakdownSentence({
      topicName: selectedContentState.title,
      sentenceId,
      language: 'japanese',
      targetLang,
      contentIndex,
    });
  };

  return (
    <WordsStudyUIContext.Provider
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
        handleBreakdownMasterSentence,
        handleBreakdownSentence,
        isBreakingDownSentenceArrState,
        setStudyFromHereTimeState,
        studyFromHereTimeState,
        transcriptRef,
        sentenceRepsState,
        elapsed,
        setElapsed,
        playFromThisContext,
        formattedWordsStudyState,
        selectedElState,
        setSelectedElState,
        setLoopSecondsState,
      }}
    >
      {children}
    </WordsStudyUIContext.Provider>
  );
};

export const useWordsStudyUIScreen = () => {
  const context = useContext(WordsStudyUIContext);

  if (!context)
    throw new Error(
      'useWordsStudyUIScreen must be used within a WordsStudyUIScreenProvider',
    );

  return context;
};
