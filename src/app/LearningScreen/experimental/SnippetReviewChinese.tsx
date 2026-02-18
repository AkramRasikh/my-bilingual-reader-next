import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import SnippetReviewChineseAudioControls from './SnippetReviewChineseAudioControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from '../useLearningScreen';
import FormattedSentenceSnippet from '@/components/custom/FormattedSentenceSnippet';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import HighlightedText from '@/components/custom/HighlightedText';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import { ContentTranscriptTypes, Snippet } from '@/app/types/content-types';
import SnippetReviewBoundaryToggles from './SnippetReviewBoundaryToggles';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';
import getColorByIndex from '@/utils/get-color-by-index';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';

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
}

const SnippetReviewChinese = ({
  snippetData,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  handleUpdateSnippetComprehensiveReview,
  isReadyForQuickReview,
  handleBreakdownSentence,
  isBreakingDownSentenceArrState,
  currentTimeTing,
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
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const ulRef = useRef<NodeJS.Timeout | null>(null);
  const vocab = snippetData?.vocab;

  const contractionAmount = snippetData?.isContracted ? 0.75 : 1.5;
  const startTime = snippetData.time - contractionAmount;
  const endTime = snippetData.time + contractionAmount;

  const {
    wordsForSelectedTopic,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    sentenceMapMemoized,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const onMoveLeft = () => {
    setStartIndexKeyState(startIndexKeyState - 1);
    setEndIndexKeyState(endIndexKeyState - 1);
  };

  const onMoveRight = () => {
    setStartIndexKeyState(startIndexKeyState + 1);
    setEndIndexKeyState(endIndexKeyState + 1);
  };

  const onExpandLength = () => {
    setLengthAdjustmentState(lengthAdjustmentState + 1);
  };

  const onContractLength = () => {
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
    // targetLangformatted,
    wordsFromSentence,
    wordsInSuggestedText,
    targetLangWithVocabStartIndex,
    sentencesToBreakdown,
  } = useMemo(() => {
    const wordsInSuggestedText = findAllInstancesOfWordsInSentence(
      snippetData?.focusedText || snippetData?.suggestedFocusText || '',
      wordsState,
    );

    const wordsFromSentence = findAllInstancesOfWordsInSentence(
      snippetData.targetLang,
      wordsState,
    );

    const targetLangformatted = underlineWordsInSentence(
      snippetData.targetLang,
      wordsFromSentence,
      true,
    );

    // Build a new array with vocab startIndex mapped onto the relevant targetLangformatted chunks
    let targetLangWithVocabStartIndex = [...targetLangformatted];
    if (snippetData.vocab && snippetData.vocab.length > 0) {
      snippetData.vocab.forEach((vocabItem, vocabIdx) => {
        const { surfaceForm, sentenceId, meaning } = vocabItem;
        if (!surfaceForm) return;
        // Find all occurrences of the vocab surfaceForm in the sentence
        let start = 0;
        while (start < targetLangformatted.length) {
          // Try to match the vocab surfaceForm at this position
          let match = true;
          for (let j = 0; j < surfaceForm.length; j++) {
            if (targetLangformatted[start + j]?.text !== surfaceForm[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            // Assign startIndex, secondForIndex, and sentenceId (if available) to all matched chars
            for (let j = 0; j < surfaceForm.length; j++) {
              const index = start + j;
              targetLangWithVocabStartIndex[index] = {
                ...targetLangWithVocabStartIndex[index],
                startIndex: vocabIdx,
                surfaceForm,
                meaning,
                secondForIndex:
                  isReadyForQuickReview && Number?.(getSecondForIndex(index)),
                ...(sentenceId ? { sentenceId } : {}),
              };
            }
            // Move past this match to avoid overlapping
            start += surfaceForm.length;
          } else {
            start++;
          }
        }
      });
    }

    // Collect unique sentenceIds (excluding null/undefined) and their first index and surfaceForm
    const sentencesToBreakdownMap = new Map();
    targetLangWithVocabStartIndex.forEach((item, idx) => {
      if (item.sentenceId && !sentencesToBreakdownMap.has(item.sentenceId)) {
        sentencesToBreakdownMap.set(item.sentenceId, {
          startIndex: item.startIndex,
          surfaceForm: item.surfaceForm,
          meaning: item.meaning,
        });
      }
    });
    const sentencesToBreakdown = Array.from(
      sentencesToBreakdownMap.entries(),
    ).map(([sentenceId, { startIndex, surfaceForm }]) => ({
      sentenceId,
      startIndex,
      surfaceForm,
    }));

    return {
      targetLangformatted,
      wordsFromSentence,
      wordsInSuggestedText,
      targetLangWithVocabStartIndex,
      sentencesToBreakdown,
    };
  }, [snippetData, wordsState, matchStartKey, matchEndKey]);

  const pinyinStart = Math.max(0, matchStartKey - 5);

  const pinyinTing = targetLangWithVocabStartIndex.slice(
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
                    wordsForSelectedTopic={wordsForSelectedTopic}
                    handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                    wordsFromSentence={wordsFromSentence}
                    languageSelectedState={languageSelectedState}
                    matchStartKey={matchStartKey}
                    matchEndKey={matchEndKey}
                    handleSaveFunc={handleSaveFunc}
                    currentTime={currentTimeTing}
                  />
                </div>
                <SnippetReviewPinyinHelper
                  pinyinTing={pinyinTing}
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

export default SnippetReviewChinese;
