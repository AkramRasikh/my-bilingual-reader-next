import { useRef, useState } from 'react';
import useData from '../Providers/useData';
import { useFetchData } from '../Providers/FetchDataProvider';
import { getAudioURL } from '@/utils/get-media-url';
import SentenceBlock from '@/components/custom/SentenceBlock';

const IsolatedSentenceAudio = ({ contextData }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimerMasterRef = useRef(null);
  const { wordsState } = useData();
  const { languageSelectedState } = useFetchData();

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
  const hasAudio = contextData?.hasAudio;
  const title = contextData.title;
  const hasIndividualAudio = hasAudio;
  const source = hasIndividualAudio
    ? getAudioURL(contextData.id, languageSelectedState)
    : getAudioURL(title, languageSelectedState);

  return (
    <div>
      <SentenceBlock
        thisSentencesWordsState={contextData.wordsFromSentence}
        sentence={contextData}
        // sentenceIndex={1}
        handleMouseLeave={handleMouseLeave}
        handleMouseEnter={handleMouseEnter}
        wordPopUpState={wordPopUpState}
        setWordPopUpState={setWordPopUpState}
        handleDeleteWordDataProvider={() => {}}
        wordsState={wordsState}
        url={source}
        languageSelectedState={languageSelectedState}
        wide
      />
    </div>
  );
};

export default IsolatedSentenceAudio;
