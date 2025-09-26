import { Button } from '@/components/ui/button';
import useTranscriptItem from './useTranscriptItem';
import { MenuIcon } from 'lucide-react';

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
          <Button
            id='copy'
            variant='ghost'
            className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
            onClick={handleCopy}
          >
            📋
          </Button>
          <Button
            id='review'
            variant='ghost'
            className='border border-amber-200 rounded-sm p-0.5 transition active:scale-95 cursor-pointer'
            onClick={handleReview}
          >
            {hasBeenReviewed ? '🗑️' : '⏰'}
          </Button>
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
