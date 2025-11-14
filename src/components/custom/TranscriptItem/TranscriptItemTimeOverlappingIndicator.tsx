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
}) => {
  return thisHasSavedSnippetOverlap.map((item, index) => {
    return (
      <div className='relative h-2' key={index}>
        <div
          className='absolute bg-blue-700 opacity-50 rounded'
          style={{
            width: `${item.percentageOverlap}%`,
            left: `${item.startPoint}%`,
            height: '100%',
          }}
        />
      </div>
    );
  });
};

export default TranscriptItemTimeOverlappingIndicator;
