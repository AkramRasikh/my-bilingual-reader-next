import { Toaster } from 'sonner';
import useData from './useData';
import SentenceBlock from './SentenceBlock';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

const SentenceReviewContainer = () => {
  const [progressState, setProgressState] = useState(0);
  const [initNumState, setInitNumState] = useState();
  const { sentencesState } = useData();

  const numberOfSentences = sentencesState.length;

  useEffect(() => {
    if (!initNumState) {
      setInitNumState(numberOfSentences);
    }
  }, [initNumState]);

  useEffect(() => {
    if (!initNumState || !numberOfSentences) {
      return;
    }
    const progressValue =
      ((initNumState - numberOfSentences) / initNumState) * 100;

    setProgressState(progressValue);
  }, [numberOfSentences, initNumState]);

  const slicedSentences = sentencesState.slice(0, 5);

  return (
    <div style={{ padding: 10 }}>
      <Toaster />
      <Progress value={progressState} className='w-full' />

      <ul className='mt-1.5 mb-1.5'>
        <p className='text-center my-2'>{numberOfSentences} Sentences</p>
        {slicedSentences?.map((sentence, index) => {
          const sentenceIndex = index + 1 + ') ';
          return (
            <li key={sentence.id} className='mb-2'>
              <SentenceBlock
                sentence={sentence}
                sentenceIndex={sentenceIndex}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SentenceReviewContainer;
