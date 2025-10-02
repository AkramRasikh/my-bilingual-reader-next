import { useRef } from 'react';
import FormattedSentence from './FormattedSentence';
import { NewSentenceBreakdown } from './SentenceBreakdown';
import useLearningScreen from './LearningScreen/useLearningScreen';

const ComprehensiveTranscriptItem = ({ contentItem }) => {
  const { wordPopUpState, setWordPopUpState, wordsForSelectedTopic } =
    useLearningScreen();
  const hoverTimerMasterRef = useRef<NodeJS.Timeout | null>(null);

  const hasSentenceBreakdown = contentItem?.sentenceStructure;
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
        // ref={ulRef}
        targetLangformatted={targetLangformatted}
        handleMouseLeave={handleMouseLeave}
        handleMouseEnter={handleMouseEnter}
        wordPopUpState={wordPopUpState}
        setWordPopUpState={setWordPopUpState}
        wordsForSelectedTopic={wordsForSelectedTopic}
      />
      <p>{baseLang}</p>
      {hasSentenceBreakdown && (
        <>
          <hr className='bg-gray-500' />
          <NewSentenceBreakdown
            vocab={contentItem.vocab}
            meaning={contentItem.meaning}
            sentenceStructure={contentItem.sentenceStructure}
            // handleSaveFunc={handleSaveFunc}
          />
        </>
      )}
    </div>
  );
};

export default ComprehensiveTranscriptItem;
