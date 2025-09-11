'use client';
import { createContext, useState } from 'react';

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
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
