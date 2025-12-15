import { useEffect, useMemo, useState } from 'react';
import WordCard from '@/components/custom/WordCard';
import useLearningScreen from '../useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const LearningScreenWordCard = ({ word, indexNum }) => {
  const [collapseState, setCollapseState] = useState(false);
  const [triggerHideState, setTriggerHideState] = useState(false);
  const {
    playFromThisContext,
    isVideoPlaying,
    handlePause,
    masterPlay,
    contentSnippets,
    handlePlayFromHere,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordBasketState,
    updateWordDataProvider,
    addWordToBasket,
    addImageDataProvider,
  } = useFetchData();

  const wordHasOverlappingSnippetTime = useMemo(() => {
    // Preference non-preSnippets first
    const matchesWord = (item) =>
      item?.focusedText?.includes(word.surfaceForm) ||
      item?.focusedText?.includes(word.baseForm) ||
      item?.suggestedFocusText?.includes(word.surfaceForm) ||
      item?.suggestedFocusText?.includes(word.baseForm);

    // Try to find a non-preSnippet first
    let overlappedWord = contentSnippets.find(
      (item) => matchesWord(item) && !item?.isPreSnippet,
    );

    // Fall back to any matching snippet (including preSnippets)
    if (!overlappedWord) {
      overlappedWord = contentSnippets.find(matchesWord);
    }

    if (overlappedWord) {
      const time = overlappedWord.time;
      return overlappedWord?.isContract ? time - 0.75 : time - 1.5;
    }
  }, [word, contentSnippets]);

  useEffect(() => {
    let timeoutId;

    if (collapseState) {
      timeoutId = setTimeout(() => setTriggerHideState(true), 300);
    }

    return () => {
      // Cleanup — clear any pending timeout
      clearTimeout(timeoutId);
    };
  }, [collapseState]);

  const handleUpdateWord = async (arg) => {
    const isWordData = arg?.isWordData;
    try {
      if (!isWordData) {
        setCollapseState(true);
      }
      const wordResBool = await updateWordDataProvider(arg);
      return wordResBool;
    } catch (error) {
    } finally {
      if (!isWordData) {
        setCollapseState(false);
      }
    }
  };

  const handlePlayFromContextFinal = (args) => {
    if (wordHasOverlappingSnippetTime) {
      handlePlayFromHere(wordHasOverlappingSnippetTime);
      return;
    }

    playFromThisContext(args);
  };
  const isInBasket = wordBasketState?.some((i) => i?.id === word.id);

  const wordContextIsPlaying =
    isVideoPlaying && word?.contexts?.[0] === masterPlay;

  return (
    <li className={clsx('mx-auto', collapseState ? 'w-full' : '')}>
      {collapseState && (
        <div className='relative w-full p-3'>
          <div className='absolute left-5/10 top-1/3'>
            <LoadingSpinner />
          </div>
        </div>
      )}
      <div
        className={clsx(
          'transition-all duration-300 overflow-hidden',
          collapseState
            ? 'max-h-0 opacity-0 py-0 my-0'
            : 'max-h-[700px] opacity-100 py-1',
          triggerHideState ? 'hidden' : '',
        )}
      >
        <WordCard
          {...word}
          indexNum={indexNum}
          updateWordData={handleUpdateWord}
          addWordToBasket={addWordToBasket}
          isInBasket={isInBasket}
          addImageDataProvider={addImageDataProvider}
          playFromThisContext={handlePlayFromContextFinal}
          languageSelectedState={languageSelectedState}
          wordContextIsPlaying={wordContextIsPlaying}
          handlePause={handlePause}
          wordHasOverlappingSnippetTime={wordHasOverlappingSnippetTime}
        />
      </div>
    </li>
  );
};

export default LearningScreenWordCard;
