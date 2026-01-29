import clsx from 'clsx';
import { useState } from 'react';

const TranscriptItemTimeOverlappingIndicatorMulti = ({
  thisHasSavedSnippetOverlap,
  handleDeleteSnippet,
  handleLoopHere,
  contentItemId,
}) => {
  const [transcriptItemLoadingState, setTranscriptItemLoadingState] =
    useState('');

  const handleDeleteSnippetItem = async (snippetItem) => {
    try {
      setTranscriptItemLoadingState(snippetItem.snippetId);
      await handleDeleteSnippet({
        ...snippetItem,
        id: snippetItem.snippetId,
      });
    } finally {
      setTranscriptItemLoadingState('');
    }
  };

  return (
    <div
      className='relative flex flex-col gap-1'
      data-testid={`transcript-time-overlap-indicator-multi-${contentItemId}`}
    >
      {thisHasSavedSnippetOverlap.map((item, index) => {
        const snippetId = item.snippetId;
        const isPreSnippet = item?.isPreSnippet;
        const hasNoReview = !item?.hasReview;
        const thisSnippetIsLoading = transcriptItemLoadingState === snippetId;
        return (
          <div
            key={index}
            className={clsx(
              'h-3 opacity-50 rounded flex justify-around',
              hasNoReview
                ? 'bg-gray-400'
                : isPreSnippet
                  ? 'bg-amber-300'
                  : 'bg-blue-700',
              thisSnippetIsLoading
                ? 'animate-pulse bg-red-700 opacity-100'
                : '',
            )}
            style={{
              width: `${item.percentageOverlap}%`,
              marginLeft: `${item.startPoint}%`,
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
              onDoubleClick={async () => await handleDeleteSnippetItem(item)}
            >
              ❌
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TranscriptItemTimeOverlappingIndicatorMulti;
