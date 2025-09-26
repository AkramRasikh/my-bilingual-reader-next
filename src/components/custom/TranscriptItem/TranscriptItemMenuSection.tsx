import { Button } from '@/components/ui/button';
import useTranscriptItem from './useTranscriptItem';
import { MenuIcon } from 'lucide-react';

const TranscriptItemMenuSection = () => {
  const { showMenuState, setShowMenuState, contentItem, handleReviewFunc } =
    useTranscriptItem();

  const hasBeenReviewed = contentItem?.reviewData?.due;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
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
  );
};

export default TranscriptItemMenuSection;
