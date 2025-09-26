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

export default TranscriptItemTimeOverlappingIndicator;
