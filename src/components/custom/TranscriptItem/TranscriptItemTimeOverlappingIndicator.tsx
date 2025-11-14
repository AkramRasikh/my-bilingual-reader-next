import clsx from 'clsx';
import { useState } from 'react';

const TranscriptItemTimeOverlappingIndicator = ({
  thisSnippetOverlapState,
}) => (
  <div className='relative h-1'>
    <div
      className='absolute bg-red-500 opacity-50 rounded'
      style={{
        width: `${thisSnippetOverlapState.percentageOverlap}%`,
        left: `${thisSnippetOverlapState.startPoint}%`,
        height: '100%',
      }}
    />
  </div>
);

export const TranscriptItemTimeOverlappingIndicatorMulti = ({
  thisHasSavedSnippetOverlap,
  handleDeleteSnippet,
  handleLoopHere,
}) => {
  const [transcriptItemLoadingState, setTranscriptItemLoadingState] =
    useState('');

  const handleDeleteSnippetItem = async (id) => {
    try {
      setTranscriptItemLoadingState(id);
      await handleDeleteSnippet(id);
    } catch (error) {
    } finally {
      setTranscriptItemLoadingState('');
    }
  };

  return (
    <div className='relative h-3'>
      {thisHasSavedSnippetOverlap.map((item, index) => {
        const snippetId = item.snippetId;
        const thisSnippetIsLoading = transcriptItemLoadingState === snippetId;
        return (
          <div
            key={index}
            className={clsx(
              'absolute bg-blue-700 opacity-50 rounded flex justify-around',
              transcriptItemLoadingState
                ? 'animate-pulse bg-red-700 opacity-100'
                : '',
            )}
            style={{
              width: `${item.percentageOverlap}%`,
              left: `${item.startPoint}%`,
              height: '100%',
            }}
          >
            <button
              className='m-auto'
              disabled={thisSnippetIsLoading}
              onClick={() =>
                handleLoopHere({
                  time: item.time,
                  isContracted: item?.isContracted,
                })
              }
              style={{
                fontSize: 5,
              }}
            >
              ⏯️
            </button>
            <button
              className='m-auto'
              disabled={thisSnippetIsLoading}
              style={{
                fontSize: 5,
              }}
              onDoubleClick={async () =>
                await handleDeleteSnippetItem(item.snippetId)
              }
            >
              ❌
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TranscriptItemTimeOverlappingIndicator;
