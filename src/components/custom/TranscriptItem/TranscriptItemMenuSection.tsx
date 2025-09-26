import { Button } from '@/components/ui/button';
import useTranscriptItem from './useTranscriptItem';
import { MenuIcon } from 'lucide-react';
import TranscriptItemBreakdownSentence from './TranscriptItemBreakdownSentence';

const TranscriptItemMenuSection = () => {
  const {
    showMenuState,
    setShowMenuState,
    contentItem,
    handleReviewTranscriptItem,
  } = useTranscriptItem();

  const hasBeenReviewed = contentItem?.reviewData?.due;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleReview = () =>
    handleReviewTranscriptItem({
      sentenceId: contentItem.id,
      isRemoveReview: hasBeenReviewed,
    });

  return (
    <>
      {showMenuState ? (
        <div
          className='flex flex-col gap-0.5'
          style={{
            animation: 'fadeIn 0.5s ease-out forwards',
          }}
        >
          <>
            <Button
              id='show-menu'
              variant='secondary'
              className='rounded transparent'
              onClick={() => setShowMenuState(!showMenuState)}
            >
              <MenuIcon />
            </Button>
            <Button
              id='copy'
              variant='ghost'
              className='border rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
              onClick={handleCopy}
            >
              📋
            </Button>
            <Button
              id='review'
              variant='ghost'
              className='border rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
              onClick={handleReview}
            >
              {hasBeenReviewed ? '🗑️' : '⏰'}
            </Button>
            <TranscriptItemBreakdownSentence />
          </>
        </div>
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
    </>
  );
};

export default TranscriptItemMenuSection;
