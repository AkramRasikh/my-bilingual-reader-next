import { useState } from 'react';
import ClickAndConfirm from '../ClickAndConfirm';

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
      <ClickAndConfirm
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        onClick={handleDeleteFunc}
        isLoadingState={isLoadingState}
      />
    </>
  );
};

export default HoverWordCardActive;
