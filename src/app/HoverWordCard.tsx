import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import useData from './useData';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import clsx from 'clsx';

const HoverWordCard = ({ text, wordPopUpState, setWordPopUpState }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isOriginalWordSettingState, setIsOriginalWordSettingState] =
    useState(false);

  const { wordsState, wordsForSelectedTopic, handleDeleteWordDataProvider } =
    useData();

  useEffect(() => {
    const textIsOriginalToSelectedTopic = wordsForSelectedTopic.some(
      (item) => text === item.baseForm || text === item.surfaceForm,
    );

    if (textIsOriginalToSelectedTopic) {
      setIsOriginalWordSettingState(true);
    }
  }, [wordsForSelectedTopic]);

  const handleDeleteFunc = async () => {
    try {
      const wordDataToDelete = wordPopUpState.find(
        (item) => item.baseForm === text || item.surfaceForm === text,
      );

      setIsLoadingState(true);
      await handleDeleteWordDataProvider({
        wordId: wordDataToDelete.id,
      });
    } catch (error) {
    } finally {
      setIsLoadingState(false);
    }
  };

  const onHoverTrigger = () => {
    const wordsAmongstHighlightedText = wordsState?.filter((item) => {
      if (item.baseForm === text || item.surfaceForm === text) {
        return true;
      }
      return false;
    });

    setWordPopUpState(wordsAmongstHighlightedText);
  };

  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        className={clsx(
          'p-0',
          isOriginalWordSettingState ? 'bg-blue-50 rounded' : '',
        )}
        style={{
          textDecorationLine: 'underline',
        }}
        onMouseEnter={onHoverTrigger}
      >
        <span>{text}</span>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        <div className='flex justify-between gap-4'>
          <div className='space-y-1'>
            {wordPopUpState?.map((word, index) => {
              return (
                <p className='text-sm' key={index}>
                  {word.baseForm}, {word.surfaceForm}, {word.definition},{' '}
                  {word.phonetic}, {word?.transliteration}
                </p>
              );
            })}
          </div>
        </div>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className='bg-red-500 text-white px-3 py-1 rounded w-fit my-1 text-xs'
          >
            Delete
          </button>
        ) : (
          <div className='flex gap-2 my-1'>
            {isLoadingState && (
              <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
                <LoadingSpinner />
              </div>
            )}
            <button
              onClick={handleDeleteFunc}
              className='bg-red-600 text-white px-3 py-1 rounded text-xs'
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className='bg-gray-300 text-black px-3 py-1 rounded text-xs'
            >
              Cancel
            </button>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default HoverWordCard;
