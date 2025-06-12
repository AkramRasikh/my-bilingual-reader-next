'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const MenuSection = ({
  contentItem,
  setShowSentenceBreakdownState,
  showSentenceBreakdownState,
  handleReviewFunc,
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
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const hasBeenReviewed = contentItem?.reviewData?.due;
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

      {hasBeenReviewed ? (
        <button
          className='border rounded-lg p-1 transition active:scale-95 cursor-pointer'
          onClick={async () =>
            await handleReviewFunc({
              sentenceId: contentItem.id,
              isRemoveReview: true,
            })
          }
        >
          Reviewed! (remove it?)
        </button>
      ) : (
        <button
          onClick={async () =>
            await handleReviewFunc({
              sentenceId: contentItem.id,
              isRemoveReview: false,
            })
          }
          className='border rounded-lg p-1 transition active:scale-95 cursor-pointer'
        >
          Review ⏰
        </button>
      )}
      <button
        className='border rounded-lg p-1 transition active:scale-95 cursor-pointer'
        onClick={handleCopy}
      >
        Copy
      </button>
    </div>
  );
};

export default MenuSection;
