import { arabic } from '@/app/languages';
import { transliterationMatcher } from '@/utils/transliteration-matcher';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';

export const TranscriptItemContext = createContext(null);

export const TranscriptItemProvider = ({
  threeSecondLoopState,
  overlappingSnippetDataState,
  contentItem,
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
  scrollToElState,
  wordsForSelectedTopic,
  isWordStudyMode,
  languageSelectedState,
  indexNum,
  isSentenceReviewMode,
  isComprehensiveMode,
  savedSnippetsMemoized,
  handleDeleteSnippet,
  setThreeSecondLoopState,
  setContractThreeSecondLoopState,
  handlePlayFromHere,
  biggestOverlappedSnippet,
  overlappingTextMemoized,
  handleSaveSnippet,
  children,
}) => {
  const transcriptItemContainerRef = useRef(null);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [showSentenceBreakdownState, setShowSentenceBreakdownState] =
    useState(false);
  const [overrideMiniReviewState, setOverrideMiniReviewState] = useState(false);
  const [showMenuState, setShowMenuState] = useState(false);
  const [collapseState, setCollapseState] = useState(false);
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

  const isArabic = languageSelectedState === arabic;

  const targetLang = contentItem.targetLang;
  const transliteration = contentItem?.transliteration;

  const highlightedTextsArabicTransliteration = useMemo(() => {
    if (!isArabic) {
      return '';
    }
    if (!highlightedTextState) {
      return '';
    }

    const transliterationLength = transliteration.split(' ').length;
    const targetLangLength = targetLang.split(' ').length;
    const translitEqualsTarget = transliterationLength === targetLangLength;

    if (!translitEqualsTarget) {
      return;
    }

    const firstHighlightedEl = highlightedTextState.split(' ')[0];

    const highlightStart = targetLang.indexOf(firstHighlightedEl);
    const highlightEnd = highlightStart + highlightedTextState.length;

    const correspondingSegment = transliterationMatcher(
      targetLang,
      transliteration,
      highlightStart,
      highlightEnd,
    );

    return correspondingSegment;
    // Output: "udaaharan vaakya"
  }, [highlightedTextState, isArabic, targetLang, transliteration]);

  useEffect(() => {
    if (
      transcriptItemContainerRef.current &&
      scrollToElState === contentItem.id
    ) {
      transcriptItemContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [transcriptItemContainerRef.current, scrollToElState]);

  const thisSnippetOverlapMemoized = useMemo(() => {
    if (!threeSecondLoopState || overlappingSnippetDataState.length === 0) {
      return null;
    }

    return overlappingSnippetDataState.find((i) => i.id === contentItem.id);
  }, [threeSecondLoopState, overlappingSnippetDataState, contentItem]);

  const thisHasSavedSnippetOverlapMemoized = useMemo(() => {
    if (!savedSnippetsMemoized || savedSnippetsMemoized.length === 0) {
      return null;
    }

    const hasOverlappingSnippet = savedSnippetsMemoized.filter(
      (i) => i.id === contentItem.id,
    );

    return hasOverlappingSnippet;
  }, [savedSnippetsMemoized, contentItem.id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        highlightedTextState &&
        transcriptItemContainerRef.current &&
        !transcriptItemContainerRef.current.contains(event.target)
      ) {
        setHighlightedTextState(''); // or whatever action you need
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [transcriptItemContainerRef, highlightedTextState]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (
        !anchorNode ||
        !transcriptItemContainerRef.current?.contains(anchorNode)
      )
        return;

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
    if (showThisSentenceBreakdownPreviewState) {
      setShowThisSentenceBreakdownPreviewState(false);
    }
  }, [showThisSentenceBreakdownPreviewState]);

  const handleLoopHere = ({ time, isContracted }) => {
    setThreeSecondLoopState(time);
    setContractThreeSecondLoopState(isContracted);
    handlePlayFromHere?.(time);
  };

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
    if (!hasSentenceBreakdown) return null;
    setShowThisSentenceBreakdownPreviewState(true);
  };

  const handleReviewTranscriptItem = async (arg) => {
    try {
      setIsLoadingState(true);
      if (isComprehensiveMode) {
        setCollapseState(true);
      }
      await handleReviewFunc(arg);
    } catch (error) {
      console.log('## handleReviewTranscriptItem error', error);
    } finally {
      if (isComprehensiveMode) {
        setCollapseState(false);
      }
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
        isWordStudyMode,
        languageSelectedState,
        highlightedTextsArabicTransliteration,
        isSentenceReviewMode,
        indexNum,
        transcriptItemContainerRef,
        collapseState,
        setCollapseState,
        isComprehensiveMode,
        thisHasSavedSnippetOverlap: thisHasSavedSnippetOverlapMemoized,
        handleDeleteSnippet,
        handleLoopHere,
        biggestOverlappedSnippet,
        overlappingTextMemoized,
        handleSaveSnippet,
        thisSnippetOverlapMemoized,
      }}
    >
      {children}
    </TranscriptItemContext.Provider>
  );
};
