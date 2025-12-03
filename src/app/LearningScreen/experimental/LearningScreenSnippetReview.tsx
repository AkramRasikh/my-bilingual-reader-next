import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { highlightApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence';
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
import { useMemo, useRef, useState } from 'react';
import useLearningScreen from '../useLearningScreen';
import FormattedSentence from '@/components/custom/FormattedSentence';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { findAllInstancesOfWordsInSentence } from '@/utils/find-all-instances-of-words-in-sentences';

function expandWordsIntoChunks(words) {
  let globalIdx = 0;

  return words.flatMap((word) => {
    const underline = word.style?.textDecorationLine === 'underline';

    return word.text.split('').map((char) => {
      const chunk = {
        text: char,
        style: word.style,
        index: globalIdx,
      };

      // Only if this word has underline, attach its full text
      if (underline) {
        chunk.originalText = word.text;
      }

      globalIdx++;
      return chunk;
    });
  });
}

const LearningScreenSnippetReview = ({
  item,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  highlightFocusedText,
  handleReviewSnippets,
}) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const thisIsPlaying = isVideoPlaying && threeSecondLoopState === item.time;
  const isPreSnippet = item?.isPreSnippet;
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const { handleUpdateSnippet, wordsForSelectedTopicMemoized } =
    useLearningScreen();
  const { pureWordsMemoized, languageSelectedState, wordsState } =
    useFetchData();

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
    return highlightApprox(
      item.targetLang,
      item.focusedText || item.suggestedFocusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      endIndexKeyState,
    );
  }, [item, isLoadingSaveSnippetState, startIndexKeyState, endIndexKeyState]);

  const onUpdateSnippet = async () => {
    if (!textMatch) {
      return;
    }
    try {
      setIsLoadingSaveSnippetState(true);
      const boolSuccess = await handleUpdateSnippet({
        id: item.id,
        isPreSnippet: false,
        focusedText: textMatch,
      });
      if (boolSuccess) {
        console.log('## Success, change state?');
        onReset(); // because of flow in map
      }
    } catch (error) {
      console.log('## onUpdateSnippet error', error);
    } finally {
      setIsLoadingSaveSnippetState(false);
    }
  };

  const { granularFormattedSentence, wordsFromSentence } = useMemo(() => {
    const targetLangformatted = underlineWordsInSentence(
      item.targetLang,
      pureWordsMemoized,
    );
    const granularFormattedSentence =
      expandWordsIntoChunks(targetLangformatted);
    const wordsFromSentence = findAllInstancesOfWordsInSentence(
      item.targetLang,
      wordsState,
    );

    return {
      granularFormattedSentence,
      wordsFromSentence,
    };
  }, [item, pureWordsMemoized, wordsState]);

  const indexHasChanged = endIndexKeyState !== 0 || startIndexKeyState !== 0;

  return (
    <div className='relative'>
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
                  time: item.time,
                  isContracted: item.isContracted,
                })
              }
            >
              {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            {item?.isPreSnippet && (
              <RabbitIcon className='fill-amber-300 rounded m-auto' />
            )}
          </div>
          <FormattedSentence
            targetLangformatted={granularFormattedSentence}
            handleMouseLeave={handleMouseLeave}
            handleMouseEnter={handleMouseEnter}
            wordPopUpState={wordPopUpState}
            setWordPopUpState={setWordPopUpState}
            wordsForSelectedTopic={wordsForSelectedTopicMemoized}
            handleDeleteWordDataProvider={() => {}}
            wordsFromSentence={wordsFromSentence}
            languageSelectedState={languageSelectedState}
            matchStartKey={matchStartKey}
            matchEndKey={matchEndKey}
          />
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
          contentItem={item}
          handleReviewFunc={handleReviewSnippets}
        />
      </div>
    </div>
  );
};

export default LearningScreenSnippetReview;
