'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const MenuSection = ({
  contentItem,
  setShowSentenceBreakdownState,
  showSentenceBreakdownState,
  handleBreakdownSentence,
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
  return (
    <div className='flex gap-8 justify-center border-t-1 pt-1.5'>
      {contentItem?.sentenceStructure && !showSentenceBreakdownState ? (
        <div className='border rounded-lg p-1 transition active:scale-95 cursor-pointer mt-auto mb-auto relative'>
          <button onClick={() => setShowSentenceBreakdownState(true)}>
            show breakdown
          </button>
        </div>
      ) : contentItem?.sentenceStructure ? (
        <div className='border rounded-lg p-1 transition active:scale-95 cursor-pointer mt-auto mb-auto relative'>
          <button onClick={() => setShowSentenceBreakdownState(false)}>
            close
          </button>
        </div>
      ) : (
        <div className='border rounded-lg p-1 transition active:scale-95 cursor-pointer mt-auto mb-auto relative'>
          <>
            <button onClick={handleBreakdownSentenceFunc}>Breakdown</button>
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
