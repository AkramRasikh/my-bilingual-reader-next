import TranscriptItem from './TranscriptItem';

const Transcript = ({
  hasPreviousVideo,
  hasFollowingVideo,
  getNextTranscript,
  setSecondsState,
  formattedTranscriptState,
  isVideoPlaying,
  handlePause,
  handleFromHere,
  masterPlay,
  handleReviewFunc,
  handleBreakdownSentence,
  sentenceHighlightingState,
  setSentenceHighlightingState,
  isGenericItemLoadingState,
  breakdownSentencesArrState,
  handleOpenBreakdownSentence,
  setBreakdownSentencesArrState,
  isPressDownShiftState,
  loopTranscriptState,
  setLoopTranscriptState,
  overlappingSnippetDataState,
  threeSecondLoopState,
  isInReviewMode,
}) => {
  return (
    <div className='flex-1'>
      <div>
        {hasPreviousVideo && (
          <button
            className='m-auto flex p-2.5'
            onClick={() => {
              getNextTranscript();
              setSecondsState();
            }}
          >
            ⏫⏫⏫⏫⏫
          </button>
        )}
        <ul
          className='border rounded-lg p-1 pt-20' // temp additional padding
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            margin: 'auto',
            overflow: 'scroll',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {formattedTranscriptState.map((contentItem, index) => {
            return (
              <TranscriptItem
                key={index}
                isGenericItemLoadingState={isGenericItemLoadingState}
                contentItem={contentItem}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleFromHere={handleFromHere}
                masterPlay={masterPlay}
                handleReviewFunc={handleReviewFunc}
                handleBreakdownSentence={handleBreakdownSentence}
                sentenceHighlightingState={sentenceHighlightingState}
                setSentenceHighlightingState={setSentenceHighlightingState}
                handleOpenBreakdownSentence={handleOpenBreakdownSentence}
                breakdownSentencesArrState={breakdownSentencesArrState}
                setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                isPressDownShiftState={isPressDownShiftState}
                loopTranscriptState={loopTranscriptState}
                setLoopTranscriptState={setLoopTranscriptState}
                overlappingSnippetDataState={overlappingSnippetDataState}
                threeSecondLoopState={threeSecondLoopState}
                isInReviewMode={isInReviewMode}
              />
            );
          })}
        </ul>
        <div>
          {hasFollowingVideo && (
            <button
              className='m-auto flex p-2.5'
              onClick={() => {
                getNextTranscript(true);
                setSecondsState();
              }}
            >
              ⏬⏬⏬⏬⏬
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;
