import { useRef, useState } from 'react';
import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SentenceBlock from '@/components/custom/SentenceBlock';
import useData from '../Providers/useData';
import WordsStudyUIVideoEl from './WordsStudyUIVideoEl';
import { useFetchData } from '../Providers/FetchDataProvider';

const IsolatedSentenceAudio = ({ contextData }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimerMasterRef = useRef(null);
  const { wordsState } = useData();
  const { languageSelectedState } = useFetchData();
  console.log('## languageSelectedState', languageSelectedState);

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
    ? getAudioURL(hasIndividualAudio, languageSelectedState)
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

const WordsStudyUIMediaElement = () => {
  const { formattedWordsStudyState, selectedElState } = useWordsStudyUIScreen();

  const selectedEl = formattedWordsStudyState[selectedElState];
  const contextData = selectedEl.contextData;

  if (!Boolean(contextData?.length)) {
    return <span>No context</span>;
  }

  return (
    <div className='w-1/2'>
      {contextData.map((contextDataEl, index) => {
        const isMedia = contextDataEl.isMedia;

        if (isMedia) {
          return (
            <WordsStudyUIVideoEl key={index} contextDataEl={contextDataEl} />
          );
        }

        return (
          <IsolatedSentenceAudio key={index} contextData={contextDataEl} />
        );
      })}
    </div>
  );
};

export default WordsStudyUIMediaElement;
