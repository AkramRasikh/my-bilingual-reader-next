import useTranscriptItem from '@/components/custom/TranscriptItem/useTranscriptItem';
import { Button } from '@/components/ui/button';
import { Hammer } from 'lucide-react';

const TranscriptItemBreakdownSentence = () => {
  const {
    contentItem,
    handleBreakdownSentenceTranscriptItem,
    isBreakdownSentenceLoadingState,
  } = useTranscriptItem();

  return (
    <>
      {!contentItem?.sentenceStructure && !isBreakdownSentenceLoadingState && (
        <Button
          id='breakdown-sentence'
          variant='ghost'
          onDoubleClick={handleBreakdownSentenceTranscriptItem}
          className={
            'border rounded-sm transition active:scale-95 cursor-pointer h-6 w-6'
          }
        >
          <Hammer />
        </Button>
      )}
    </>
  );
};

export default TranscriptItemBreakdownSentence;
