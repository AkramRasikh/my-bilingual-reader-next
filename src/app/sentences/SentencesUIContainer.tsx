import SentencesUITranscriptItem from './SentencesUITranscriptItem';
import { useSentencesUIScreen } from './SentencesUIProvider';
import WordCard from '@/components/custom/WordCard';
import { useFetchData } from '../Providers/FetchDataProvider';

const SentencesUIContainer = () => {
  const { sentencesInQueue, selectedSentenceDataMemoized } =
    useSentencesUIScreen();

  const { updateWordDataProvider, languageSelectedState } = useFetchData();
  const thisItemsWords = selectedSentenceDataMemoized?.words;
  const thisItemsNotes = selectedSentenceDataMemoized?.notes;

  return (
    <div>
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
            <p className='text-sm font-medium italic max-w-lg m-auto'>
              Sentence notes: {thisItemsNotes}
            </p>
          )}
        </div>
        <div>
          <ul className='mt-1.5 mb-1.5'>
            {sentencesInQueue.map((sentence, index) => {
              return (
                <li key={sentence.id} className='mb-2'>
                  <SentencesUITranscriptItem
                    sentence={sentence}
                    sentenceNum={index}
                  />
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
