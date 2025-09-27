import clsx from 'clsx';
import useTranscriptItem from '@/components/custom/TranscriptItem/useTranscriptItem';
import { Button } from '@/components/ui/button';

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
          className={clsx(
            'border rounded-sm p-0.5 transition active:scale-95 cursor-pointer',
          )}
        >
          ⚒️
        </Button>
      )}
    </>
  );
};

export default TranscriptItemBreakdownSentence;
