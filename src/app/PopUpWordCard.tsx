import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function PopUpWordCard({
  word,
  handleDelete,
  onClose,
}: {
  word: any;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const handleDeleteFunc = async () => {
    try {
      setIsLoadingState(true);
      await handleDelete({ wordId: word.id, wordBaseForm: word.baseForm });
    } catch (error) {
    } finally {
      setIsLoadingState(false);
    }
  };
  return (
    <div className='border rounded-lg p-4 shadow-sm max-w-sm space-y-2 gap-1.5 relative'>
      <div>
        {isLoadingState && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
            <LoadingSpinner />
          </div>
        )}
      </div>
      <div className='flex gap-1.5 justify-between'>
        <p>
          {word.baseForm}, {word.surfaceForm}, {word.definition},{' '}
          {word.phonetic}, {word?.transliteration}
        </p>
        <button
          className='border'
          style={{
            backgroundColor: 'lightblue',
            padding: 5,
            marginTop: 0,
            borderRadius: 5,
            height: 'fit-content',
          }}
          onClick={onClose}
        >
          ❌
        </button>
      </div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className='bg-red-500 text-white px-3 py-1 rounded'
        >
          Delete
        </button>
      ) : (
        <div className='flex gap-2'>
          <button
            onClick={handleDeleteFunc}
            className='bg-red-600 text-white px-3 py-1 rounded'
          >
            Confirm Delete
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className='bg-gray-300 text-black px-3 py-1 rounded'
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
