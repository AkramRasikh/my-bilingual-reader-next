import { arabic } from '@/app/languages';
import { transliterationMatcher } from '@/utils/transliteration-matcher';
import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

interface HandleReviewFuncParams {
  sentenceId: string;
  isRemoveReview?: boolean;
}

interface OverlappingTextTypes {
  targetLang: string;
  baseLang: string;
  suggestedFocusText: string;
}

interface TranscriptItemProviderProps {
  threeSecondLoopState: number | null;
  overlappingSnippetDataState: OverlappingSnippetData[];
  contentItem: FormattedTranscriptTypes;
  loopTranscriptState: FormattedTranscriptTypes[];
  masterPlay: string | null;
  isGenericItemLoadingState: boolean;
  snippetLoadingState: string[];
  handleSaveWord: (params: {
    highlightedWord: string;
    highlightedWordSentenceId: string;
    contextSentence: string;
    meaning?: string;
    isGoogle: boolean;
    originalContext: string;
    time?: number;
  }) => Promise<void>;
  handleDeleteWordDataProvider: (wordData: WordTypes) => Promise<boolean>;
  wordsState: WordTypes[];
  isInReviewMode: boolean;
  onlyShowEngState: boolean;
  setLoopTranscriptState: Dispatch<SetStateAction<FormattedTranscriptTypes[]>>;
  handleReviewFunc: (params: HandleReviewFuncParams) => Promise<void>;
  isVideoPlaying: boolean;
  handlePause: () => void;
  handleFromHere: (time: number) => void;
  handleBreakdownSentence: (params: {
    sentenceId: string;
    targetLang: string;
  }) => Promise<void>;
  isBreakingDownSentenceArrState: string[];
  scrollToElState: string | null;
  wordsForSelectedTopic: WordTypes[];
  languageSelectedState: string;
  indexNum: number;
  isComprehensiveMode?: boolean;
  savedSnippetsMemoized: Snippet[];
  handleDeleteSnippet: (snippetId: string) => Promise<void>;
  setThreeSecondLoopState: Dispatch<SetStateAction<number | null>>;
  setContractThreeSecondLoopState: Dispatch<SetStateAction<boolean>>;
  handlePlayFromHere: (time: number) => void;
  biggestOverlappedSnippet: string | null;
  overlappingTextMemoized: OverlappingTextTypes | null;
  handleSaveSnippet: (snippetArgs: OverlappingTextTypes) => Promise<void>;
  originalContext: string;
  isReadyForQuickReview?: boolean;
  children: ReactNode;
}

export const TranscriptItemContext = createContext(null);

export const TranscriptItemProvider = ({
  threeSecondLoopState,
  overlappingSnippetDataState,
  contentItem,
  loopTranscriptState,
  masterPlay,
  isGenericItemLoadingState,
  snippetLoadingState,
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
  languageSelectedState,
  indexNum,
  isComprehensiveMode,
  savedSnippetsMemoized,
  handleDeleteSnippet,
  setThreeSecondLoopState,
  setContractThreeSecondLoopState,
  handlePlayFromHere,
  biggestOverlappedSnippet,
  overlappingTextMemoized,
  handleSaveSnippet,
  originalContext,
  isReadyForQuickReview,
  children,
}: TranscriptItemProviderProps) => {
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
    function handleClickOutside(event: MouseEvent) {
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
    if (showThisSentenceBreakdownPreviewState) {
      setShowThisSentenceBreakdownPreviewState(false);
    }
  }, [showThisSentenceBreakdownPreviewState]);

  const handleLoopHere = ({
    time,
    isContracted,
  }: {
    time: number;
    isContracted: boolean;
  }) => {
    setThreeSecondLoopState(time);
    setContractThreeSecondLoopState(isContracted);
    handlePlayFromHere?.(time);
  };

  const handleMouseEnter = (text: string) => {
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

  const handleSaveFunc = async (
    isGoogle: boolean,
    thisWord: string,
    thisWordMeaning?: string,
  ) => {
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: highlightedTextState || thisWord,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        meaning: thisWordMeaning,
        isGoogle,
        originalContext,
        time: contentItem?.time,
      });
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingState(false);
    }
  };

  const handleBreakdownSentenceTranscriptItem = async () => {
    const hasSentenceBreakdown = contentItem?.sentenceStructure;
    if (hasSentenceBreakdown) {
      setShowSentenceBreakdownState(true);
      return;
    }
    try {
      setIsBreakdownSentenceLoadingState(true);
      await handleBreakdownSentence({
        sentenceId: contentItem.id,
        targetLang: contentItem.targetLang,
      });
    } finally {
      setIsBreakdownSentenceLoadingState(false);
    }
  };

  const handleDeleteFunc = async (wordData: WordTypes) => {
    const resBool = await handleDeleteWordDataProvider(wordData);
    if (resBool) {
      setWordPopUpState([]);
    }
    return resBool;
  };

  const handleOnMouseEnterSentence = () => {
    if (!hasSentenceBreakdown) return null;
    setShowThisSentenceBreakdownPreviewState(true);
  };

  const handleReviewTranscriptItem = async (arg: HandleReviewFuncParams) => {
    try {
      setIsLoadingState(true);
      if (isComprehensiveMode) {
        setCollapseState(true);
      }
      await handleReviewFunc(arg);
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
        handleMouseEnter,
        handleMouseLeave,
        isSentenceLooping,
        masterPlay,
        isGenericItemLoadingState,
        handleSaveFunc,
        handleDeleteFunc,
        handleOnMouseEnterSentence,
        isInReviewMode,
        onlyShowEngState,
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
        languageSelectedState,
        highlightedTextsArabicTransliteration,
        indexNum,
        transcriptItemContainerRef,
        collapseState,
        setCollapseState,
        isComprehensiveMode,
        thisHasSavedSnippetOverlap: thisHasSavedSnippetOverlapMemoized,
        handleDeleteSnippet,
        snippetLoadingState,
        handleLoopHere,
        biggestOverlappedSnippet,
        overlappingTextMemoized,
        handleSaveSnippet,
        thisSnippetOverlapMemoized,
        isReadyForQuickReview,
      }}
    >
      {children}
    </TranscriptItemContext.Provider>
  );
};
