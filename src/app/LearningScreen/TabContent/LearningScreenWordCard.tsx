import { useEffect, useMemo, useState } from 'react';
import WordCard from '@/components/custom/WordCard';
import useLearningScreen from '../useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import { getWordTimeFromSnippets } from '@/utils/get-word-time-from-snippets';

const LearningScreenWordCard = ({ word, indexNum, isReadyForQuickReview }) => {
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
    updateWordDataProvider,
    addImageDataProvider,
  } = useFetchData();

  const wordHasOverlappingSnippetTime = useMemo(() => {
    return getWordTimeFromSnippets(word, contentSnippets);
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
          addImageDataProvider={addImageDataProvider}
          playFromThisContext={handlePlayFromContextFinal}
          languageSelectedState={languageSelectedState}
          wordContextIsPlaying={wordContextIsPlaying}
          handlePause={handlePause}
          wordHasOverlappingSnippetTime={wordHasOverlappingSnippetTime}
          isReadyForQuickReview={isReadyForQuickReview}
        />
      </div>
    </li>
  );
};

export default LearningScreenWordCard;
