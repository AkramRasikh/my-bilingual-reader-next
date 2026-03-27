import { useEffect, useMemo, useRef, useState } from 'react';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';
import { useSnippetReviewDataMemoized } from './useSnippetReviewDataMemoized';
import { LanguageEnum } from '@/app/languages';
import {
  HandleDeleteWordDataProviderCallTypes,
  HandleSaveWordCallTypes,
} from '@/app/Providers/FetchDataProvider';
import {
  ContentTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';

interface HandleReviewSnippetsFinalArg {
  isRemoveReview?: boolean;
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
}

export interface SnippetReviewControllerProps {
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
  handleLoopHere: (arg: { time: number; isContracted?: boolean }) => void;
  isVideoPlaying: boolean;
  threeSecondLoopState: number | null;
  handleUpdateSnippetComprehensiveReview: (arg: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
  }) => Promise<void>;
  isReadyForQuickReview: boolean;
  handleBreakdownSentence: (arg: { sentenceId: string }) => Promise<void>;
  isBreakingDownSentenceArrState?: string[];
  currentTime?: number;
  getSentenceDataOfOverlappingWordsDuringSave: (
    time: number,
    highlightedText: string,
  ) => string | null;
  selectedContentTitleState: string;
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  languageSelectedState: LanguageEnum;
  wordsState: WordTypes[];
  handleSaveWord: (params: HandleSaveWordCallTypes) => Promise<void> | void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
}

export function useSnippetReviewController({
  snippetData,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  handleUpdateSnippetComprehensiveReview,
  isReadyForQuickReview,
  handleBreakdownSentence,
  isBreakingDownSentenceArrState,
  currentTime,
  getSentenceDataOfOverlappingWordsDuringSave,
  selectedContentTitleState,
  sentenceMapMemoized,
  languageSelectedState,
  wordsState,
  handleSaveWord,
  handleDeleteWordDataProvider,
}: SnippetReviewControllerProps) {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);
  const [wordPopUpState, setWordPopUpState] = useState<any[]>([]);
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [isLoadingWordState, setIsLoadingWordState] = useState(false);

  const selectionContainerRef = useRef<HTMLElement | null>(null);

  const thisIsPlaying =
    isVideoPlaying && threeSecondLoopState === snippetData.time;
  const isPreSnippet = snippetData?.isPreSnippet;
  // Keep this as a loose type: different consumers expect different shapes.
  const vocab: any = snippetData?.vocab as any;

  const contractionAmount = snippetData?.isContracted ? 0.75 : 1.5;
  const startTime = snippetData.time - contractionAmount;
  const endTime = snippetData.time + contractionAmount;
  const isChinese = languageSelectedState === LanguageEnum.Chinese;
  const isArabic = languageSelectedState === LanguageEnum.Arabic;

  const { textMatch, matchStartKey, matchEndKey } = useMemo(() => {
    return highlightSnippetTextApprox(
      snippetData.targetLang,
      snippetData?.focusedText || snippetData?.suggestedFocusText || '',
      isLoadingSaveSnippetState,
      startIndexKeyState,
      lengthAdjustmentState,
    );
  }, [
    snippetData,
    isLoadingSaveSnippetState,
    startIndexKeyState,
    lengthAdjustmentState,
  ]);

  const hasSnippetText = Boolean(textMatch);

  const onMoveLeft = () => {
    const stopUserSpillingOverStartPoint = !(matchStartKey <= 0);
    if (!stopUserSpillingOverStartPoint) return;
    setStartIndexKeyState(startIndexKeyState - 1);
    setEndIndexKeyState(endIndexKeyState - 1);
  };

  const onMoveRight = () => {
    const stopUserSpillingOverEndPoint = !(
      matchEndKey >=
      snippetData.targetLang.length - 1
    );
    if (!stopUserSpillingOverEndPoint) return;
    setStartIndexKeyState(startIndexKeyState + 1);
    setEndIndexKeyState(endIndexKeyState + 1);
  };

  const onExpandLength = () => {
    const stopUserSpillingOverEndPoint = !(
      matchEndKey >=
      snippetData.targetLang.length - 1
    );
    if (!stopUserSpillingOverEndPoint) return;
    setLengthAdjustmentState(lengthAdjustmentState + 1);
  };

  const onContractLength = () => {
    if (matchEndKey - matchStartKey < 1) return;
    setLengthAdjustmentState(lengthAdjustmentState - 1);
  };

  const onReset = () => {
    setStartIndexKeyState(0);
    setEndIndexKeyState(0);
    setLengthAdjustmentState(0);
  };

  const handlePlaySnippet = () => {
    handleLoopHere({
      time: snippetData.time,
      isContracted: snippetData.isContracted,
    });
  };

  const handleSaveFunc = async (
    isGoogle: boolean,
    thisWord: unknown,
    thisWordMeaning: unknown,
  ) => {
    try {
      setIsLoadingWordState(true);
      const belongingSentenceId = getSentenceDataOfOverlappingWordsDuringSave(
        snippetData.time,
        highlightedTextState,
      );
      if (belongingSentenceId) {
        await handleSaveWord({
          highlightedWord: highlightedTextState || String(thisWord ?? ''),
          highlightedWordSentenceId: belongingSentenceId,
          contextSentence: snippetData.targetLang,
          meaning: String(thisWordMeaning ?? ''),
          isGoogle,
          originalContext: selectedContentTitleState,
          time: sentenceMapMemoized[belongingSentenceId]?.time,
        });
      } else {
        console.log('## no belonding sentence found');
      }
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingWordState(false);
    }
  };

  const handleSaveSnippetFlow = async () => {
    if (!textMatch) return;
    try {
      setIsLoadingSaveSnippetState(true);
      await handleUpdateSnippetComprehensiveReview({
        snippetData: {
          ...snippetData,
          isPreSnippet: false,
          focusedText: textMatch,
        },
      });
      setStartIndexKeyState(0);
      setEndIndexKeyState(0);
      setLengthAdjustmentState(0);
    } finally {
      setIsLoadingSaveSnippetState(false);
    }
  };

  const onUpdateSnippet = async () => {
    await handleSaveSnippetFlow();
  };

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      const container = selectionContainerRef.current;
      if (!anchorNode || !container?.contains(anchorNode)) return;

      setHighlightedTextState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useSnippetLoopEvents({
    enabled: isReadyForQuickReview,
    hasSnippetText,
    matchEndKey,
    matchStartKey,
    targetLangLength: snippetData.targetLang.length,
    onAdjustLength: (delta) => setLengthAdjustmentState((prev) => prev + delta),
    onShiftStart: (delta) => setStartIndexKeyState((prev) => prev + delta),
    onSaveSnippet: async () => {
      console.log('## 🎮 snippet-loop-save');
      await onUpdateSnippet();
    },
  });

  useEffect(() => {
    if (!isReadyForQuickReview) return;

    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);
      if (!gamepad) return;

      if (gamepad.buttons[1]?.pressed && !gamepad.buttons[8]?.pressed) {
        handlePlaySnippet();
      }
    };

    const intervalId = setInterval(handleGamepadPress, 100);
    return () => clearInterval(intervalId);
  }, [
    isReadyForQuickReview,
    thisIsPlaying,
    snippetData.time,
    snippetData.isContracted,
  ]);

  const getSecondForIndex = (index: number) => {
    if (
      typeof index !== 'number' ||
      typeof matchStartKey !== 'number' ||
      typeof matchEndKey !== 'number' ||
      typeof startTime !== 'number' ||
      typeof endTime !== 'number'
    ) {
      return null;
    }
    if (index < matchStartKey || index > matchEndKey) return null;
    const totalKeys = matchEndKey - matchStartKey;
    const totalTime = endTime - startTime;
    if (totalKeys === 0) return startTime;
    const t = (index - matchStartKey) / totalKeys;
    return startTime + t * totalTime;
  };

  const {
    wordsFromSentence,
    wordsInSuggestedText,
    targetLangWithVocabStartIndex,
    sentencesToBreakdown,
  } = useSnippetReviewDataMemoized({
    snippetData,
    wordsState,
    matchStartKey,
    matchEndKey,
    isReadyForQuickReview,
    getSecondForIndex,
  });

  const pinyinStart = Math.max(0, matchStartKey - 5);
  const slicedSnippetSegment: any = targetLangWithVocabStartIndex.slice(
    pinyinStart,
    Math.min(targetLangWithVocabStartIndex.length, matchEndKey + 6),
  );

  const handleReviewSnippetsFinal = async (
    arg: HandleReviewSnippetsFinalArg,
  ): Promise<void> => {
    const isRemoveReview = arg?.isRemoveReview;
    await handleUpdateSnippetComprehensiveReview({
      snippetData: arg.snippetData,
      isRemoveReview: isRemoveReview && !(wordsInSuggestedText?.length > 0),
    });
  };

  const indexHasChanged =
    endIndexKeyState !== 0 ||
    startIndexKeyState !== 0 ||
    lengthAdjustmentState !== 0;

  const showTransliteration = isChinese || isArabic;

  return {
    selectionContainerRef,

    // input passthroughs often needed by views
    snippetData,
    isBreakingDownSentenceArrState,
    currentTime,
    languageSelectedState,
    handleBreakdownSentence,
    handleDeleteWordDataProvider,
    isReadyForQuickReview,

    // derived
    thisIsPlaying,
    isPreSnippet,
    vocab,
    showTransliteration,
    pinyinStart,
    slicedSnippetSegment,
    targetLangWithVocabStartIndex,
    sentencesToBreakdown,
    wordsFromSentence,
    matchStartKey,
    matchEndKey,
    indexHasChanged,

    // selection / word popup
    wordPopUpState,
    setWordPopUpState,
    highlightedTextState,
    isLoadingWordState,

    // loading
    isLoadingSaveSnippetState,

    // actions
    handlePlaySnippet,
    handleSaveFunc,
    onMoveLeft,
    onMoveRight,
    onExpandLength,
    onContractLength,
    onReset,
    onUpdateSnippet,
    handleReviewSnippetsFinal,
  };
}

