'use client';
import { isNumber } from '@/utils/is-number';
import { createContext, useEffect, useRef, useState, useContext } from 'react';
import useData from '../Providers/useData';
import useTrackMasterTranscript from '../LearningScreen/hooks/useManageThreeSecondLoop';
import { useFetchData } from '../Providers/FetchDataProvider';
import useWordsStudyUIinit from './useWordsStudyUIinit';
import { useProgressHeader } from '@/components/custom/ProgressHeader';

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
  const [selectedElState, setSelectedElState] = useState(0);
  const [isInReviewMode, setIsInReviewMode] = useState(false);
  const [onlyShowEngState, setOnlyShowEngState] = useState(false);
  const [showWordsBasketState, setShowWordsBasketState] = useState(false);
  const [showOnVideoTranscriptState, setShowOnVideoTranscriptState] =
    useState(true);
  const [sentenceHighlightingState, setSentenceHighlightingState] =
    useState('');
  const [wordsRepsState, setWordsRepsState] = useState(0);
  const [studyFromHereTimeState, setStudyFromHereTimeState] = useState(null);

  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [formattedWordsStudyState, setFormattedWordsStudyState] = useState([]);
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
  const [progressState, setProgressState] = useState(0);
  const [contractThreeSecondLoopState, setContractThreeSecondLoopState] =
    useState(false);

  const [elapsed, setElapsed] = useState(0);
  const { updateWordDataProvider } = useData();

  const {
    sentencesState,
    pureWordsMemoized,
    contentState,
    wordsState,
    wordsToReviewOnMountState,
    wordsForReviewMemoized,
  } = useFetchData();

  useProgressHeader({
    setProgressState,
    initNumState: wordsToReviewOnMountState,
    currentStateNumber: wordsForReviewMemoized.length,
  });

  useWordsStudyUIinit({
    setFormattedWordsStudyState,
    wordsForReviewMemoized,
    pureWordsMemoized,
    contentState,
    sentencesState,
    wordsState,
  });

  const masterPlay =
    currentTime && loopSecondsState.length > 0
      ? loopSecondsState[Math.floor(currentTime)]
      : secondsState?.length > 0
      ? secondsState[Math.floor(currentTime)]
      : '';

  const handlePlayFromHere = (time: number) => {
    if (ref.current && isVideoPlaying) {
      ref.current.pause();
    } else if (ref.current) {
      ref.current.currentTime = time;
      ref.current.play();
    }
  };

  const updateWordDataWordsStudyUI = async (args) => {
    try {
      const updateWordSuccess = await updateWordDataProvider(args);
      if (updateWordSuccess) {
        setWordsRepsState(wordsRepsState + 1);
      }
    } catch (error) {
      console.log('## error updateWordDataWordsStudyUI', error);
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

    // const thisStartTime = realStartTime + time;

    handlePlayFromHere(time);
  };
  const handlePause = () => ref.current.pause();

  const handleRewind = () =>
    (ref.current.currentTime = ref.current.currentTime - 3);

  const playFromThisContext = () => {
    const firstContextDataPoint =
      formattedWordsStudyState[selectedElState]?.contextData?.[0];

    const isMedia = firstContextDataPoint.isMedia;

    if (isMedia && firstContextDataPoint) {
      handleFromHere(firstContextDataPoint.time);
    } else {
      console.log('## playFromThisContext Not media!');
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

  const handleBreakdownMasterSentence = async () => {};

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {};

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
        handleLoopThis3Second,
        handleShiftLoopSentence,
        handleLoopThisSentence,
        handleBreakdownMasterSentence,
        handleBreakdownSentence,
        setStudyFromHereTimeState,
        studyFromHereTimeState,
        transcriptRef,
        elapsed,
        setElapsed,
        playFromThisContext,
        formattedWordsStudyState,
        selectedElState,
        setSelectedElState,
        setLoopSecondsState,
        updateWordDataWordsStudyUI,
        wordsRepsState,
        setWordsRepsState,
        progressState,
        wordsForReviewMemoized,
        wordsToReviewOnMountState,
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
