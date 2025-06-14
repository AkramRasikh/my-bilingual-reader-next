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
}) => {
  return (
    <div
      style={{
        margin: 'auto',
        maxWidth: 600,
      }}
    >
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
          className='border rounded-lg p-1'
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
                contentItem={contentItem}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleFromHere={handleFromHere}
                masterPlay={masterPlay}
                handleReviewFunc={handleReviewFunc}
                handleBreakdownSentence={handleBreakdownSentence}
                sentenceHighlightingState={sentenceHighlightingState}
                setSentenceHighlightingState={setSentenceHighlightingState}
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
