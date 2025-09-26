import { useState } from 'react';
import clsx from 'clsx';
import useTranscriptItem from '@/components/custom/TranscriptItem/useTranscriptItem';
import { Button } from '@/components/ui/button';

const TranscriptItemBreakdownSentence = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { contentItem, handleBreakdownSentence } = useTranscriptItem();

  const handleBreakdownSentenceFunc = async () => {
    try {
      setIsLoading(true);
      await handleBreakdownSentence({
        sentenceId: contentItem.id,
        targetLang: contentItem.targetLang,
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!contentItem?.sentenceStructure && (
        <Button
          id='breakdown-sentence'
          variant='ghost'
          onDoubleClick={handleBreakdownSentenceFunc}
          className={clsx(
            'border rounded-sm p-0.5 transition active:scale-95 cursor-pointer',
            isLoading ? 'animate-spin bg-lime-400 p-0 rounded-4xl' : '',
          )}
        >
          ⚒️
        </Button>
      )}
    </>
  );
};

export default TranscriptItemBreakdownSentence;
