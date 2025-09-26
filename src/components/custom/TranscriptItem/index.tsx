import clsx from 'clsx';
import HighlightedTextSection from '@/app/HighlightedTextSection';
import { NewSentenceBreakdown } from '@/app/SentenceBreakdown';
import LoadingSpinner from '@/app/LoadingSpinner';
import { MenuIcon, Repeat2 } from 'lucide-react';
import FormattedSentence from '@/app/FormattedSentence';
import { Button } from '@/components/ui/button';
import { getTimeDiffSRS } from '@/app/getTimeDiffSRS';
import ReviewSRSToggles from '@/app/ReviewSRSToggles';
import useTranscriptItem from './useTranscriptItem';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    setHighlightedTextState,
    showSentenceBreakdownState,
    showMenuState,
    setShowMenuState,
    thisSnippetOverlapState,
    isLoadingState,
    showThisSentenceBreakdownPreviewState,
    setShowThisSentenceBreakdownPreviewState,
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
    handleOnMouseEnterSentence,
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div
      className={clsx(
        'rounded-lg px-2 py-1 shadow h-fit border-2 ',
        isDueNow
          ? 'border-red-500'
          : hasBeenReviewed
          ? 'border-amber-500'
          : 'border-blue-200',
        !(isDueNow && isInReviewMode) ? 'opacity-25' : 'opacity-100',
      )}
      style={{
        gap: 5,
        animation: !isInReviewMode ? 'fadeIn 0.5s ease-out forwards' : '',
      }}
      onMouseEnter={handleOnMouseEnterSentence}
      onMouseLeave={() => {
        setWordPopUpState([]);
        setShowThisSentenceBreakdownPreviewState(false);
      }}
    >
      {thisSnippetOverlapState && (
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

          <div className='flex flex-col gap-0.5'>
            {showMenuState ? (
              <>
                <Button
                  id='show-menu'
                  variant='secondary'
                  size='icon'
                  className='bgmt-0 rounded transparent'
                  onClick={() => setShowMenuState(!showMenuState)}
                >
                  <MenuIcon />
                </Button>
                <button
                  id='copy'
                  className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                  onClick={handleCopy}
                >
                  📋
                </button>
                {hasBeenReviewed ? (
                  <button
                    id='review'
                    className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                    onClick={async () =>
                      await handleReviewFunc({
                        sentenceId: contentItem.id,
                        isRemoveReview: true,
                      })
                    }
                  >
                    🗑️
                  </button>
                ) : (
                  <button
                    id='review'
                    onClick={async () =>
                      await handleReviewFunc({
                        sentenceId: contentItem.id,
                        isRemoveReview: false,
                      })
                    }
                    className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
                  >
                    ⏰
                  </button>
                )}
                {/* <MenuSection
                  contentItem={contentItem}
                  setShowSentenceBreakdownState={setShowSentenceBreakdownState}
                  showSentenceBreakdownState={showSentenceBreakdownState}
                  handleBreakdownSentence={handleBreakdownSentence}
                  handleOpenBreakdownSentence={handleOpenBreakdownSentence}
                  setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                /> */}
              </>
            ) : (
              <Button
                id='show-menu'
                className='mt-0 rounded'
                variant='secondary'
                size='icon'
                onClick={() => setShowMenuState(!showMenuState)}
              >
                <MenuIcon />
              </Button>
            )}
          </div>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TranscriptItem;
