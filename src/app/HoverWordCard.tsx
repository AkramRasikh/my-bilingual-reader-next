import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import useData from './useData';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/custom/LoadingSpinner';
import clsx from 'clsx';

const WordInHoverCard = ({ word }) => {
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { handleDeleteWordDataProvider } = useData();

  const handleDeleteFunc = async () => {
    try {
      setIsLoadingState(true);
      await handleDeleteWordDataProvider({
        wordId: word.id,
      });
    } catch (error) {
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <>
      <div className='flex justify-between gap-4'>
        <div className='space-y-1'>
          <p className='text-sm'>
            {word.baseForm}, {word.surfaceForm}, {word.definition},{' '}
            {word.phonetic}, {word?.transliteration}
          </p>
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
    </>
  );
};

const HoverWordCard = ({ text, wordPopUpState, setWordPopUpState }) => {
  const [isOriginalWordSettingState, setIsOriginalWordSettingState] =
    useState(false);

  const { wordsState, wordsForSelectedTopic } = useData();

  useEffect(() => {
    const textIsOriginalToSelectedTopic = wordsForSelectedTopic.some(
      (item) => text === item.baseForm || text === item.surfaceForm,
    );

    if (textIsOriginalToSelectedTopic) {
      setIsOriginalWordSettingState(true);
    }
  }, [wordsForSelectedTopic]);

  const onHoverTrigger = () => {
    const hoverTings = wordsState.filter((item) => {
      const baseForm = item.baseForm;
      const surfaceForm = item.surfaceForm;
      if (text.includes(baseForm) || text.includes(surfaceForm)) {
        return true;
      }
    });

    setWordPopUpState(hoverTings);
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
            {wordPopUpState?.map((word, index) => (
              <WordInHoverCard key={index} word={word} />
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HoverWordCard;
