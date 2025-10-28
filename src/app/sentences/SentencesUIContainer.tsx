import { Toaster } from 'sonner';
import { Progress } from '@/components/ui/progress';
import SentencesUITranscriptItem from './SentencesUITranscriptItem';
import { useSentencesUIScreen } from './SentencesUIProvider';

const SentencesUIContainer = () => {
  const { sentencesInQueue, progressState, numberOfSentences } =
    useSentencesUIScreen();
  return (
    <div>
      <Toaster position='top-center' />
      <Progress value={progressState} className='w-full' />

      <p className='text-center my-2'>{numberOfSentences} Sentences</p>
      <ul className='mt-1.5 mb-1.5'>
        {sentencesInQueue.map((sentence, index) => {
          const sentenceIndex = index + 1 + ') ';
          return (
            <li key={sentence.id} className='mb-2'>
              <SentencesUITranscriptItem
                sentence={sentence}
                sentenceIndex={sentenceIndex}
              />
              {/* <SentenceBlockContainer
                sentence={sentence}
                sentenceIndex={sentenceIndex}
                languageSelectedState={languageSelectedState}
              /> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SentencesUIContainer;
