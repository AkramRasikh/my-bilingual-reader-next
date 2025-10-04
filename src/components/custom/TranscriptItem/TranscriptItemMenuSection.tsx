import { Button } from '@/components/ui/button';
import useTranscriptItem from './useTranscriptItem';
import { BookMarked, BookOpenCheck, Copy, MenuIcon } from 'lucide-react';
import TranscriptItemBreakdownSentence from './TranscriptItemBreakdownSentence';
import AnimationWrapper from '../AnimationWrapper';

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
        <AnimationWrapper className='flex flex-col gap-1'>
          <Button
            id='show-menu'
            variant='secondary'
            className='rounded transparent h-6 w-6'
            onClick={() => setShowMenuState(!showMenuState)}
          >
            <MenuIcon />
          </Button>
          <Button
            id='copy'
            variant='ghost'
            className='border rounded-sm p-0.5 transition-transform duration-150 active:scale-75 h-6 w-6'
            onClick={handleCopy}
          >
            <Copy />
          </Button>
          <Button
            id='review'
            variant='ghost'
            className='border rounded-sm p-0.5 transition active:scale-95 cursor-pointer h-6 w-6'
            onClick={handleReview}
          >
            {hasBeenReviewed ? <BookOpenCheck /> : <BookMarked />}
          </Button>
          <TranscriptItemBreakdownSentence />
        </AnimationWrapper>
      ) : (
        <Button
          id='show-menu'
          className='mt-0 rounded border h-6 w-6'
          variant='ghost'
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
