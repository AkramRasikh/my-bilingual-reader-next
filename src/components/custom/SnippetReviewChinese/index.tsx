import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import SnippetReviewChineseAudioControls from './SnippetReviewChineseAudioControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import FormattedSentenceSnippet from '@/components/custom/SnippetReviewChinese/SnippetReviewContent';
import HighlightedText from '@/components/custom/HighlightedText';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import {
  ContentTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';
import getColorByIndex from '@/utils/get-color-by-index';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';
import SnippetReviewBoundaryToggles from './SnippetReviewBoundaryToggles';
import { LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import {
  HandleDeleteWordDataProviderCallTypes,
  HandleSaveWordCallTypes,
} from '@/app/Providers/FetchDataProvider';
import SnippetReviewBreakdownDefinitions from './SnippetReviewBreakdownDefinitions';
import { useSnippetReviewDataMemoized } from './useSnippetReviewDataMemoized';

interface HandleReviewSnippetsFinalArg {
  isRemoveReview?: boolean;
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
}

interface SnippetReviewProps {
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
  handleSaveWord: (params: HandleSaveWordCallTypes) => void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
}

const SnippetReview = ({
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
}: SnippetReviewProps) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [isLoadingWordState, setIsLoadingWordState] = useState(false);
  const thisIsPlaying =
    isVideoPlaying && threeSecondLoopState === snippetData.time;
  const isPreSnippet = snippetData?.isPreSnippet;
  const ulRef = useRef<NodeJS.Timeout | null>(null);
  const vocab = snippetData?.vocab;

  const contractionAmount = snippetData?.isContracted ? 0.75 : 1.5;
  const startTime = snippetData.time - contractionAmount;
  const endTime = snippetData.time + contractionAmount;
  const isChinese = languageSelectedState === LanguageEnum.Chinese;
  const isArabic = languageSelectedState === LanguageEnum.Arabic;
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

  const handleSaveFunc = async (isGoogle, thisWord, thisWordMeaning) => {
    try {
      setIsLoadingWordState(true);
      const belongingSentenceId = getSentenceDataOfOverlappingWordsDuringSave(
        snippetData.time,
        highlightedTextState,
      );
      if (belongingSentenceId) {
        await handleSaveWord({
          highlightedWord: highlightedTextState || thisWord,
          highlightedWordSentenceId: belongingSentenceId,
          contextSentence: snippetData.targetLang, // maybe these two should match?
          meaning: thisWordMeaning,
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

  const handleSaveSnippetFlow = async () => {
    if (!textMatch) {
      return;
    }
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
      if (!anchorNode || !ulRef.current?.contains(anchorNode)) return;

      // setSentenceHighlightingState(contentItem.id);
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
      // Find the first connected gamepad
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);

      if (!gamepad) {
        return;
      }

      // Only trigger if B button (1) is pressed AND L button (6) is NOT pressed
      // This prevents L+B combo from also triggering the play action
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

  // Function to get the second representation for a given index in the matchKey range
  const getSecondForIndex = (index) => {
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
    // Spread time evenly across keys
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

  const slicedSnippetSegment = targetLangWithVocabStartIndex.slice(
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

  return (
    <div
      className='relative'
      data-testid={`snippet-review-item-${snippetData.id}`}
    >
      {isLoadingSaveSnippetState && (
        <div className='absolute right-1/2 top-3/10'>
          <LoadingSpinner />
        </div>
      )}
      <div className='rounded border py-2 px-1'>
        <div className='flex gap-3'>
          <div className='flex-1'>
            <div className='flex mb-2 gap-1'>
              <SnippetReviewChineseAudioControls
                thisIsPlaying={thisIsPlaying}
                handlePlaySnippet={handlePlaySnippet}
                isPreSnippet={snippetData?.isPreSnippet}
                sentencesToBreakdown={sentencesToBreakdown}
                isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
                handleBreakdownSentence={handleBreakdownSentence}
              />
              <div className='w-full text-center'>
                <div className='flex text-align-justify'>
                  <FormattedSentenceSnippet
                    ref={ulRef}
                    targetLangformatted={targetLangWithVocabStartIndex}
                    wordPopUpState={wordPopUpState}
                    setWordPopUpState={setWordPopUpState}
                    handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                    wordsFromSentence={wordsFromSentence}
                    languageSelectedState={languageSelectedState}
                    matchStartKey={matchStartKey}
                    matchEndKey={matchEndKey}
                    handleSaveFunc={handleSaveFunc}
                    currentTime={currentTime}
                    isReadyForQuickReview={isReadyForQuickReview}
                  />
                </div>
                {isChinese ||
                  (isArabic && (
                    <SnippetReviewPinyinHelper
                      slicedSnippetSegment={slicedSnippetSegment}
                      getColorByIndex={getColorByIndex}
                      matchStartKey={matchStartKey}
                      matchEndKey={matchEndKey}
                      pinyinStart={pinyinStart}
                      languageSelectedState={languageSelectedState}
                    />
                  ))}

                <SnippetReviewBreakdownDefinitions
                  slicedSnippetSegment={slicedSnippetSegment}
                  getColorByIndex={getColorByIndex}
                  matchStartKey={matchStartKey}
                  matchEndKey={matchEndKey}
                  pinyinStart={pinyinStart}
                  vocab={vocab}
                />
                {highlightedTextState && (
                  <HighlightedText
                    isLoadingState={
                      isLoadingWordState || isLoadingSaveSnippetState
                    }
                    handleSaveFunc={handleSaveFunc}
                    highlightedTextState={highlightedTextState}
                  />
                )}
              </div>
            </div>
          </div>
          {isPreSnippet && (
            <div>
              <SnippetReviewBoundaryToggles
                isLoading={isLoadingSaveSnippetState}
                indexHasChanged={indexHasChanged}
                onMoveLeft={onMoveLeft}
                onReset={onReset}
                onMoveRight={onMoveRight}
                onContractLength={onContractLength}
                onExpandLength={onExpandLength}
                onUpdateSnippet={onUpdateSnippet}
              />
            </div>
          )}
        </div>
        <ReviewSRSToggles
          isSnippet
          contentItem={snippetData}
          handleReviewFunc={handleReviewSnippetsFinal}
          isReadyForQuickReview={isReadyForQuickReview}
        />
      </div>
    </div>
  );
};

export default SnippetReview;
