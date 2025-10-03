import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const HoverWordCardActive = ({ word, handleDeleteWordDataProvider }) => {
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

export default HoverWordCardActive;
