import { useRef, useState } from 'react';
import { getAudioURL, getCloudflareVideoURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SentenceBlock from '@/components/custom/SentenceBlock';
import VideoPlayer from '../VideoPlayer';
import WordsStudyUIAudioElFallback from './WordsStudyUIAudioElFallback';
import useCheckVideoIsWorking from './useCheckVideoIsWorking';
import useData from '../Providers/useData';

const IsolatedSentenceAudio = ({ contextData }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimerMasterRef = useRef(null);
  const { wordsState } = useData();

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
    ? getAudioURL(hasIndividualAudio, 'japanese')
    : getAudioURL(title, 'japanese');

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
        wide
      />
    </div>
  );
};

const WordsStudyUIVideoEl = ({ contextDataEl }) => {
  const {
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
  } = useWordsStudyUIScreen();
  const isMedia = contextDataEl.isMedia;
  const error = useCheckVideoIsWorking(ref);

  if (error) {
    return <WordsStudyUIAudioElFallback contextDataEl={contextDataEl} />;
  }

  if (isMedia) {
    const videoUrl = getCloudflareVideoURL(
      contextDataEl.generalTopicName,
      'japanese',
    );

    return (
      <VideoPlayer
        ref={ref}
        url={videoUrl}
        setIsVideoPlaying={setIsVideoPlaying}
        isVideoPlaying={isVideoPlaying}
        masterPlayComprehensiveState={contextDataEl}
        playFromHereUI={() =>
          isVideoPlaying
            ? handlePause()
            : handlePlayFromHere(
                (contextDataEl.realStartTime || 0) + contextDataEl.time,
              )
        }
      />
    );
  }
};

const WordsStudyUIMediaElement = () => {
  const { formattedWordsStudyState, selectedElState } = useWordsStudyUIScreen();

  const selectedEl = formattedWordsStudyState[selectedElState];
  const contextData = selectedEl.contextData;

  if (!Boolean(contextData?.length)) {
    return <span>No context</span>;
  }

  return (
    <div>
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
