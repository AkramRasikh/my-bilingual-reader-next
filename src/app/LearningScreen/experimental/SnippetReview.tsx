import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { PauseIcon, PlayIcon, RabbitIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from '../useLearningScreen';
import FormattedSentence from '@/components/custom/FormattedSentence';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import HighlightedText from '@/components/custom/HighlightedText';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import { ContentTranscriptTypes, Snippet } from '@/app/types/content-types';
import SnippetReviewBoundaryToggles from './SnippetReviewBoundaryToggles';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';

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

const SnippetReview = ({
  snippetData,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  handleUpdateSnippetComprehensiveReview,
  isReadyForQuickReview,
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

  const {
    wordsForSelectedTopic,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    sentenceMapMemoized,
  } = useLearningScreen();
  const { languageSelectedState, wordsState, handleSaveWord } = useFetchData();

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

  const { targetLangformatted, wordsFromSentence, wordsInSuggestedText } =
    useMemo(() => {
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

      return {
        targetLangformatted,
        wordsFromSentence,
        wordsInSuggestedText,
      };
    }, [snippetData, wordsState]);

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
              <div className='flex flex-col gap-2'>
                <Button
                  className={clsx(
                    'h-7 w-7',
                    thisIsPlaying ? 'bg-amber-300' : '',
                  )}
                  onClick={handlePlaySnippet}
                >
                  {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                {snippetData?.isPreSnippet && (
                  <RabbitIcon className='fill-amber-300 rounded m-auto mt-0' />
                )}
              </div>
              <div className='w-full'>
                <div className='flex text-align-justify'>
                  <FormattedSentence
                    ref={ulRef}
                    targetLangformatted={targetLangformatted}
                    handleMouseLeave={handleMouseLeave}
                    handleMouseEnter={handleMouseEnter}
                    wordPopUpState={wordPopUpState}
                    setWordPopUpState={setWordPopUpState}
                    wordsForSelectedTopic={wordsForSelectedTopic}
                    handleDeleteWordDataProvider={() => {}}
                    wordsFromSentence={wordsFromSentence}
                    languageSelectedState={languageSelectedState}
                    matchStartKey={matchStartKey}
                    matchEndKey={matchEndKey}
                  />
                </div>
                {vocab?.length > 0 && (
                  <div className='mt-2'>
                    <SentenceBreakdown
                      vocab={vocab}
                      meaning={''}
                      thisSentencesSavedWords={wordsFromSentence}
                      handleSaveFunc={handleSaveFunc}
                      sentenceStructure={''}
                      languageSelectedState={languageSelectedState}
                    />
                  </div>
                )}
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
