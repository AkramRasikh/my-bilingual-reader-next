import { Toaster } from 'sonner';
import useData from '../Providers/useData';

import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import useSentencesProgress from './useSentencesProgress';
import SentenceBlockContainer from './SentenceBlockContainer';

const SentencesUIContainer = () => {
  const [progressState, setProgressState] = useState(0);
  const [initNumState, setInitNumState] = useState();
  const { sentencesState } = useData();

  const numberOfSentences = sentencesState.length;

  useEffect(() => {
    if (!initNumState) {
      setInitNumState(numberOfSentences);
    }
  }, [initNumState]);

  useSentencesProgress({
    setProgressState,
    initNumState,
    numberOfSentences,
  });

  const slicedSentences = sentencesState.slice(0, 5);

  return (
    <div>
      <Toaster position='top-center' />
      <Progress value={progressState} className='w-full' />

      <p className='text-center my-2'>{numberOfSentences} Sentences</p>
      <ul className='mt-1.5 mb-1.5'>
        {slicedSentences?.map((sentence, index) => {
          const sentenceIndex = index + 1 + ') ';
          return (
            <li key={sentence.id} className='mb-2'>
              <SentenceBlockContainer
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

export default SentencesUIContainer;
