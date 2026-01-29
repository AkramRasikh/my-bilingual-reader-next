import clsx from 'clsx';

const TranscriptItemTimeOverlappingIndicatorMulti = ({
  thisHasSavedSnippetOverlap,
  handleDeleteSnippet,
  handleLoopHere,
  contentItemId,
  snippetLoadingState,
}) => {
  const handleDeleteSnippetItem = async (snippetItem) => {
    await handleDeleteSnippet({
      ...snippetItem,
      id: snippetItem.snippetId,
    });
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
        const thisSnippetIsLoading = snippetLoadingState.includes(snippetId);
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
