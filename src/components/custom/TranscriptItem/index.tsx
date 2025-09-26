import clsx from 'clsx';
import HighlightedTextSection from '@/app/HighlightedTextSection';
import { NewSentenceBreakdown } from '@/app/SentenceBreakdown';
import LoadingSpinner from '@/app/LoadingSpinner';
import { Repeat2 } from 'lucide-react';
import FormattedSentence from '@/app/FormattedSentence';
import { getTimeDiffSRS } from '@/app/getTimeDiffSRS';
import ReviewSRSToggles from '@/app/ReviewSRSToggles';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemWrapper from './TranscriptItemWrapper';
import TranscriptItemTimeOverlappingIndicator from './TranscriptItemTimeOverlappingIndicator';
import TranscriptItemMenuSection from './TranscriptItemMenuSection';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    setHighlightedTextState,
    showSentenceBreakdownState,
    thisSnippetOverlapState,
    isLoadingState,
    showThisSentenceBreakdownPreviewState,
    wordPopUpState,
    setWordPopUpState,
    ulRef,
    contentItem,
    handleMouseEnter,
    handleMouseLeave,
    closeBreakdown,
    isSentenceLooping,
    masterPlay,
    isGenericItemLoadingState,
    handleSaveFunc,
    isInReviewMode,
    onlyShowEngState,
    setBreakdownSentencesArrState,
    setLoopTranscriptState,
    handleReviewFunc,
    isVideoPlaying,
    handlePause,
    handleFromHere,
  } = useTranscriptItem();

  const baseLang = contentItem.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;
  const hasBeenReviewed = contentItem?.reviewData?.due;
  const timeNow = new Date();
  const isDueNow = new Date(hasBeenReviewed) < timeNow;

  const thisTime = contentItem.time;
  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const isGenericallyDoingAsyncAction = isGenericItemLoadingState.includes(
    contentItem.id,
  );

  return (
    <TranscriptItemWrapper>
      {thisSnippetOverlapState && (
        <TranscriptItemTimeOverlappingIndicator
          thisSnippetOverlapState={thisSnippetOverlapState}
        />
      )}
      <div
        style={{
          display: 'flex',
          gap: 5,
        }}
      >
        <div className='flex flex-col gap-1 h-fit'>
          <button
            style={{
              padding: 5,
              borderRadius: 5,
              margin: 'auto 0',
              marginTop: 0,
            }}
            className={clsx(
              'bg-gray-300',
              thisSentenceIsPlaying && isVideoPlaying && 'bg-yellow-200',
            )}
            onClick={
              thisSentenceIsPlaying && isVideoPlaying
                ? handlePause
                : () => handleFromHere(thisTime)
            }
          >
            <span
              style={{
                height: 16,
              }}
            >
              {thisSentenceIsPlaying && isVideoPlaying ? '⏸️' : '▶️'}
            </span>
          </button>

          {hasSentenceBreakdown && (
            <button
              id='show-breakdown'
              onClick={() => {
                if (showSentenceBreakdownState) {
                  closeBreakdown();
                } else {
                  setBreakdownSentencesArrState((prev) => [
                    ...prev,
                    contentItem.id,
                  ]);
                }
              }}
            >
              <span className='m-auto'>
                {showSentenceBreakdownState ? '❌' : '🧱'}
              </span>
            </button>
          )}
          {isSentenceLooping && (
            <button
              id='stop-loop'
              onClick={() => setLoopTranscriptState(null)}
              className='animate-spin'
            >
              <Repeat2 />
            </button>
          )}

          {(isGenericallyDoingAsyncAction || isLoadingState) && (
            <div className='m-auto'>
              <LoadingSpinner />
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div className={clsx(thisSentenceIsPlaying && 'bg-yellow-200 h-fit')}>
            {(showSentenceBreakdownState && hasSentenceBreakdown) ||
            showThisSentenceBreakdownPreviewState ? (
              <NewSentenceBreakdown
                vocab={contentItem.vocab}
                meaning={contentItem.meaning}
                thisSentencesSavedWords={thisSentencesSavedWords}
                handleSaveFunc={handleSaveFunc}
                sentenceStructure={contentItem.sentenceStructure}
              />
            ) : (
              <>
                <p className='flex gap-2'>
                  <FormattedSentence
                    ref={ulRef}
                    targetLangformatted={targetLangformatted}
                    handleMouseLeave={handleMouseLeave}
                    handleMouseEnter={handleMouseEnter}
                    wordPopUpState={wordPopUpState}
                    setWordPopUpState={setWordPopUpState}
                  />
                </p>
                {!onlyShowEngState && <p>{baseLang}</p>}
              </>
            )}
          </div>

          <TranscriptItemMenuSection />
        </div>
      </div>
      {isInReviewMode && isDueNow ? (
        <ReviewSRSToggles
          contentItem={contentItem}
          handleReviewFunc={handleReviewFunc}
        />
      ) : isInReviewMode && hasBeenReviewed ? (
        <p className='italic m-1 text-center'>
          Due in{' '}
          {getTimeDiffSRS({ dueTimeStamp: new Date(hasBeenReviewed), timeNow })}
        </p>
      ) : null}
      {highlightedTextState && (
        <HighlightedTextSection
          isLoadingState={isLoadingState}
          handleSaveFunc={handleSaveFunc}
          setHighlightedTextState={setHighlightedTextState}
          highlightedTextState={highlightedTextState}
        />
      )}
      {contentItem?.title && (
        <p className='flex justify-end opacity-50'>{contentItem.title}</p>
      )}
    </TranscriptItemWrapper>
  );
};

export default TranscriptItem;
