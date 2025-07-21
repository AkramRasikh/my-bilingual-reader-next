'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const MenuSection = ({
  contentItem,
  setShowSentenceBreakdownState,
  showSentenceBreakdownState,
  handleBreakdownSentence,
  handleOpenBreakdownSentence,
  setBreakdownSentencesArrState,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBreakdownSentenceFunc = async () => {
    try {
      setIsLoading(true);
      await handleBreakdownSentence({
        sentenceId: contentItem.id,
        targetLang: contentItem.targetLang,
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const closeBreakdown = () => {
    setBreakdownSentencesArrState((prev) =>
      prev.filter((item) => item !== contentItem.id),
    );
  };
  return (
    <div className='flex gap-8 justify-center border-t-1 pt-1.5'>
      {!contentItem?.sentenceStructure && (
        <div className='border rounded-lg p-1 transition active:scale-95 cursor-pointer mt-auto mb-auto relative'>
          <>
            <button
              onDoubleClick={handleBreakdownSentenceFunc}
              id='breakdown-sentence'
            >
              ⚒️
            </button>
            {isLoading && (
              <div className='m-auto w-fit-content absolute top-0 left-1/2 p-1.5'>
                <LoadingSpinner />
              </div>
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default MenuSection;
