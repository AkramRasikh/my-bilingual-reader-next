import { Toaster } from 'sonner';
import { Progress } from '@/components/ui/progress';
import SentencesUITranscriptItem from './SentencesUITranscriptItem';
import { useSentencesUIScreen } from './SentencesUIProvider';
import WordCard from '@/components/custom/WordCard';
import useData from '../Providers/useData';
import { useFetchData } from '../Providers/FetchDataProvider';
import { Button } from '@/components/ui/button';

const SentencesUIContainer = () => {
  const {
    sentencesInQueue,
    progressState,
    numberOfSentences,
    selectedSentenceDataMemoized,
    setSelectedElState,
  } = useSentencesUIScreen();

  const { updateWordDataProvider } = useData();

  const { languageSelectedState } = useFetchData();
  const thisItemsWords = selectedSentenceDataMemoized?.words;
  const thisItemsNotes = selectedSentenceDataMemoized?.notes;

  return (
    <div>
      <Toaster position='top-center' />
      <Progress value={progressState} className='w-full' />

      <p className='text-center my-2'>{numberOfSentences} Sentences</p>
      <div className='grid grid-cols-2 gap-2 max-w-6xl mx-auto'>
        <div>
          <ul className='flex flex-col gap-2 mb-2'>
            {thisItemsWords?.map((wordItem, index) => {
              return (
                <li key={index} className='mx-auto'>
                  <WordCard
                    indexNum={index + 1}
                    {...wordItem}
                    updateWordData={updateWordDataProvider}
                    playFromThisContext={() => {}}
                    languageSelectedState={languageSelectedState}
                  />
                </li>
              );
            })}
          </ul>
          {thisItemsNotes && (
            <p className='text-xs font-medium italic max-w-lg m-auto'>
              Sentence notes: {thisItemsNotes}
            </p>
          )}
        </div>
        <div>
          <ul className='mt-1.5 mb-1.5'>
            {sentencesInQueue.map((sentence, index) => {
              const sentenceIndex = index + 1 + ') ';
              return (
                <li key={sentence.id} className='mb-2'>
                  <SentencesUITranscriptItem
                    sentence={sentence}
                    sentenceIndex={sentenceIndex}
                  />
                  {/* <Button onClick={() => setSelectedElState(index)}>
                    this
                  </Button> */}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentencesUIContainer;
