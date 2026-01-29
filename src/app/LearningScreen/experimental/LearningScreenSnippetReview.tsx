import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import {
  MoveLeftIcon,
  MoveRightIcon,
  PauseIcon,
  PlayIcon,
  RabbitIcon,
  SaveIcon,
  Undo2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from '../useLearningScreen';
import FormattedSentence from '@/components/custom/FormattedSentence';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import HighlightedText from '@/components/custom/HighlightedText';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import { Snippet } from '@/app/types/content-types';

interface HandleReviewSnippetsFinalArg {
  isRemoveReview?: boolean;
  snippetData: Snippet;
}

const LearningScreenSnippetReview = ({
  snippetData,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  handleReviewSnippets,
}) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
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

  const {
    handleUpdateSnippet,
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

  const onReset = () => {
    setStartIndexKeyState(0);
    setEndIndexKeyState(0);
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
      snippetData.focusedText || snippetData.suggestedFocusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      endIndexKeyState,
    );
  }, [
    snippetData,
    isLoadingSaveSnippetState,
    startIndexKeyState,
    endIndexKeyState,
  ]);

  const onUpdateSnippet = async () => {
    if (!textMatch) {
      return;
    }
    try {
      setIsLoadingSaveSnippetState(true);
      await handleUpdateSnippet({
        snippetData: {
          ...snippetData,
          isPreSnippet: false,
          focusedText: textMatch,
        },
        isUpdate: true,
      });
      setStartIndexKeyState(0);
      setEndIndexKeyState(0);
    } finally {
      setIsLoadingSaveSnippetState(false);
    }
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

  const { targetLangformatted, wordsFromSentence, wordsInSuggestedText } =
    useMemo(() => {
      const wordsInSuggestedText = findAllInstancesOfWordsInSentence(
        snippetData.focusedText || snippetData.suggestedFocusText,
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
    await handleReviewSnippets({
      snippetData: arg.snippetData,
      wordsFromSentence: wordsInSuggestedText.length > 0,
      isRemoveReview,
    });
  };

  const indexHasChanged = endIndexKeyState !== 0 || startIndexKeyState !== 0;

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
      <div className='rounded border text-center py-2 px-1'>
        <div className='flex mb-2 gap-1'>
          <div className='flex flex-col gap-2'>
            <Button
              className={clsx('h-7 w-7', thisIsPlaying ? 'bg-amber-300' : '')}
              onClick={() =>
                handleLoopHere({
                  time: snippetData.time,
                  isContracted: snippetData.isContracted,
                })
              }
            >
              {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            {snippetData?.isPreSnippet && (
              <RabbitIcon className='fill-amber-300 rounded m-auto' />
            )}
          </div>
          <div>
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
            {highlightedTextState && (
              <HighlightedText
                isLoadingState={isLoadingWordState || isLoadingSaveSnippetState}
                handleSaveFunc={handleSaveFunc}
                setHighlightedTextState={setHighlightedTextState}
                highlightedTextState={highlightedTextState}
              />
            )}
          </div>
        </div>
        {isPreSnippet && (
          <div className='flex flex-row px-2'>
            <div className='flex flex-row gap-2 m-auto justify-center mb-3'>
              <Button
                onClick={onMoveLeft}
                variant={'outline'}
                disabled={isLoadingSaveSnippetState}
              >
                <MoveLeftIcon />
              </Button>
              <Button
                onClick={onReset}
                variant={'destructive'}
                disabled={!indexHasChanged || isLoadingSaveSnippetState}
              >
                <Undo2Icon />
              </Button>
              <Button
                onClick={onMoveRight}
                variant={'outline'}
                disabled={isLoadingSaveSnippetState}
              >
                <MoveRightIcon />
              </Button>
            </div>
            <div>
              <Button
                variant={'outline'}
                disabled={!indexHasChanged || isLoadingSaveSnippetState}
                onClick={onUpdateSnippet}
                className={clsx(
                  indexHasChanged ? 'animate-pulse bg-amber-300' : 'opacity-25',
                )}
              >
                <SaveIcon />
              </Button>
            </div>
          </div>
        )}
        <ReviewSRSToggles
          isSnippet
          contentItem={snippetData}
          handleReviewFunc={handleReviewSnippetsFinal}
        />
      </div>
    </div>
  );
};

export default LearningScreenSnippetReview;
