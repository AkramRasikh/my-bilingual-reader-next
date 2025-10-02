import { createContext, useEffect, useRef, useState } from 'react';

export const TranscriptItemContext = createContext(null);

export const TranscriptItemProvider = ({
  threeSecondLoopState,
  overlappingSnippetDataState,
  setSentenceHighlightingState,
  sentenceHighlightingState,
  contentItem,
  isPressDownShiftState,
  breakdownSentencesArrState,
  setBreakdownSentencesArrState,
  loopTranscriptState,
  masterPlay,
  isGenericItemLoadingState,
  handleSaveWord,
  handleDeleteWordDataProvider,
  wordsState,
  isInReviewMode,
  onlyShowEngState,
  setLoopTranscriptState,
  handleReviewFunc,
  isVideoPlaying,
  handlePause,
  handleFromHere,
  handleBreakdownSentence,
  isBreakingDownSentenceArrState,
  latestDueIdState,
  scrollToElState,
  wordsForSelectedTopic,
  children,
}) => {
  const ulRef = useRef<HTMLUListElement>(null);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [showSentenceBreakdownState, setShowSentenceBreakdownState] =
    useState(false);
  const [overrideMiniReviewState, setOverrideMiniReviewState] = useState(false);
  const [showMenuState, setShowMenuState] = useState(false);
  const [thisSnippetOverlapState, setThisSnippetOverlapState] = useState();

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isBreakdownSentenceLoadingState, setIsBreakdownSentenceLoadingState] =
    useState(false);
  const [
    showThisSentenceBreakdownPreviewState,
    setShowThisSentenceBreakdownPreviewState,
  ] = useState(false);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const isInSentenceBreakdown = breakdownSentencesArrState.includes(
    contentItem.id,
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const breakdownMasterState =
    isBreakdownSentenceLoadingState ||
    isBreakingDownSentenceArrState.includes(contentItem.id);

  useEffect(() => {
    if (
      (ulRef.current &&
        latestDueIdState?.triggerScroll &&
        latestDueIdState?.id === contentItem.id) ||
      (ulRef.current && scrollToElState === contentItem.id)
    ) {
      ulRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [ulRef.current, latestDueIdState, scrollToElState]);

  useEffect(() => {
    if (!threeSecondLoopState && thisSnippetOverlapState) {
      setThisSnippetOverlapState(null);
      return;
    }
    const hasOverlappingSnippet =
      overlappingSnippetDataState.length > 0 &&
      overlappingSnippetDataState.find((i) => i.id === contentItem.id);

    setThisSnippetOverlapState(hasOverlappingSnippet);
  }, [threeSecondLoopState, overlappingSnippetDataState, contentItem]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !ulRef.current?.contains(anchorNode)) return;

      setSentenceHighlightingState(contentItem.id);
      setHighlightedTextState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setShowSentenceBreakdownState(isInSentenceBreakdown);
  }, [isInSentenceBreakdown]);

  useEffect(() => {
    if (!isPressDownShiftState && showThisSentenceBreakdownPreviewState) {
      setShowThisSentenceBreakdownPreviewState(false);
    }
  }, [isPressDownShiftState, showThisSentenceBreakdownPreviewState]);

  const handleMouseEnter = (text) => {
    hoverTimer.current = setTimeout(() => {
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
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current); // Cancel if left early
      hoverTimer.current = null;
    }
  };

  const closeBreakdown = () => {
    setBreakdownSentencesArrState((prev) =>
      prev.filter((item) => item !== contentItem.id),
    );
  };

  const handleSaveFunc = async (isGoogle, thisWord, thisWordMeaning) => {
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: highlightedTextState || thisWord,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        meaning: thisWordMeaning,
        isGoogle,
      });
    } catch (error) {
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingState(false);
    }
  };

  const handleBreakdownSentenceTranscriptItem = async () => {
    try {
      setIsBreakdownSentenceLoadingState(true);
      await handleBreakdownSentence({
        sentenceId: contentItem.id,
        targetLang: contentItem.targetLang,
      });
    } catch (error) {
    } finally {
      setIsBreakdownSentenceLoadingState(false);
    }
  };

  const handleDeleteFunc = async (wordData) => {
    try {
      const resBool = await handleDeleteWordDataProvider(wordData);
      if (resBool) {
        setWordPopUpState([]);
      }
      return resBool;
    } catch (error) {
      console.log('## handleDeleteFunc error', error);
    }
  };

  const handleOnMouseEnterSentence = () => {
    if (!isPressDownShiftState || !hasSentenceBreakdown) return null;
    setShowThisSentenceBreakdownPreviewState(true);
  };

  const handleReviewTranscriptItem = async (arg) => {
    try {
      setIsLoadingState(true);
      await handleReviewFunc(arg);
    } catch (error) {
      console.log('## handleReviewTranscriptItem error', error);
    } finally {
      setIsLoadingState(false);
    }
  };

  const isSentenceLooping = loopTranscriptState?.some(
    (i) => i?.id === contentItem.id,
  );

  return (
    <TranscriptItemContext.Provider
      value={{
        contentItem,
        ulRef,
        hoverTimer,
        highlightedTextState,
        setHighlightedTextState,
        showSentenceBreakdownState,
        setShowSentenceBreakdownState,
        showMenuState,
        setShowMenuState,
        thisSnippetOverlapState,
        setThisSnippetOverlapState,
        isLoadingState,
        setIsLoadingState,
        showThisSentenceBreakdownPreviewState,
        setShowThisSentenceBreakdownPreviewState,
        wordPopUpState,
        setWordPopUpState,
        breakdownSentencesArrState,
        handleMouseEnter,
        handleMouseLeave,
        closeBreakdown,
        isSentenceLooping,
        masterPlay,
        isGenericItemLoadingState,
        handleSaveFunc,
        handleDeleteFunc,
        handleOnMouseEnterSentence,
        isInReviewMode,
        onlyShowEngState,
        setBreakdownSentencesArrState,
        setLoopTranscriptState,
        handleReviewFunc,
        isVideoPlaying,
        handlePause,
        handleFromHere,
        handleReviewTranscriptItem,
        handleBreakdownSentence,
        isBreakdownSentenceLoadingState: breakdownMasterState,
        setIsBreakdownSentenceLoadingState,
        handleBreakdownSentenceTranscriptItem,
        overrideMiniReviewState,
        setOverrideMiniReviewState,
        wordsForSelectedTopic,
      }}
    >
      {children}
    </TranscriptItemContext.Provider>
  );
};
