import { useRef, useState } from 'react';
import FormattedSentence from '../FormattedSentence';
import useLearningScreen from '../../../app/LearningScreen/useLearningScreen';
import useData from '../../../app/Providers/useData';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import { useFetchData } from '@/app/Providers/FetchDataProvider';

const TranscriptItemSecondary = ({ contentItem }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);

  const { wordsState } = useFetchData();
  const { wordsForSelectedTopic } = useLearningScreen();
  const { handleDeleteWordDataProvider } = useData();

  const hoverTimerMasterRef = useRef<NodeJS.Timeout | null>(null);

  const hasSentenceBreakdown = contentItem?.sentenceStructure;
  const wordsFromSentence = contentItem?.wordsFromSentence;
  const baseLang = contentItem?.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

  const handleMouseEnter = (text) => {
    hoverTimerMasterRef.current = setTimeout(() => {
      const wordsAmongstHighlightedText = wordsState?.filter((item) => {
        if (item.baseForm === text || item.surfaceForm === text) {
          return true;
        }
        return false;
      });

      setWordPopUpState(wordsAmongstHighlightedText);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerMasterRef.current) {
      clearTimeout(hoverTimerMasterRef.current); // Cancel if left early
      hoverTimerMasterRef.current = null;
    }
  };

  return (
    <div className='rounded border-2 p-2 mt-2 flex flex-col gap-2'>
      <FormattedSentence
        targetLangformatted={targetLangformatted}
        handleMouseLeave={handleMouseLeave}
        handleMouseEnter={handleMouseEnter}
        wordsForSelectedTopic={wordsForSelectedTopic}
        handleDeleteWordDataProvider={handleDeleteWordDataProvider}
        wordPopUpState={wordPopUpState}
        setWordPopUpState={setWordPopUpState}
        wordsFromSentence={wordsFromSentence}
      />
      <p>{baseLang}</p>
      {hasSentenceBreakdown && (
        <>
          <hr className='bg-gray-500' />
          <SentenceBreakdown
            vocab={contentItem.vocab}
            meaning={contentItem.meaning}
            sentenceStructure={contentItem.sentenceStructure}
          />
        </>
      )}
    </div>
  );
};

export default TranscriptItemSecondary;
