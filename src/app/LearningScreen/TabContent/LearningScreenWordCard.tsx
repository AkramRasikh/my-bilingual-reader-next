import { useEffect, useState } from 'react';
import WordCard from '@/components/custom/WordCard';
import useLearningScreen from '../useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const LearningScreenWordCard = ({ word, indexNum }) => {
  const [collapseState, setCollapseState] = useState(false);
  const [triggerHideState, setTriggerHideState] = useState(false);
  const { playFromThisContext, isVideoPlaying, handlePause, masterPlay } =
    useLearningScreen();
  const {
    languageSelectedState,
    wordBasketState,
    updateWordDataProvider,
    addWordToBasket,
    addImageDataProvider,
  } = useFetchData();

  useEffect(() => {
    if (collapseState) {
      setTimeout(() => setTriggerHideState(true), 300);
    }
  }, [collapseState]);

  const handleUpdateWord = async (arg) => {
    try {
      setCollapseState(true);
      await updateWordDataProvider(arg);
    } catch (error) {
      //
    } finally {
      setCollapseState(false);
    }
  };
  const isInBasket = wordBasketState?.some((i) => i?.id === word.id);

  const wordContextIsPlaying =
    isVideoPlaying && word?.contexts?.[0] === masterPlay;

  return (
    <>
      <li className='mx-auto w-full'>
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
          style={{
            animation: '',
          }}
        >
          <WordCard
            {...word}
            indexNum={indexNum}
            updateWordData={handleUpdateWord}
            addWordToBasket={addWordToBasket}
            isInBasket={isInBasket}
            addImageDataProvider={addImageDataProvider}
            playFromThisContext={playFromThisContext}
            languageSelectedState={languageSelectedState}
            wordContextIsPlaying={wordContextIsPlaying}
            handlePause={handlePause}
          />
        </div>
      </li>
    </>
  );
};

export default LearningScreenWordCard;
