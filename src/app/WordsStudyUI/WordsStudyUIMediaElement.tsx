import { getAudioURL, getCloudflareVideoURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SentenceBlock from '@/components/custom/SentenceBlock';
import VideoPlayer from '../VideoPlayer';
import WordsStudyUIAudioElFallback from './WordsStudyUIAudioElFallback';
import useCheckVideoIsWorking from './useCheckVideoIsWorking';

const IsolatedSentenceAudio = ({ contextData }) => {
  const hasAudio = contextData?.hasAudio;
  const title = contextData.title;
  const hasIndividualAudio = hasAudio;
  const source = hasIndividualAudio
    ? getAudioURL(hasIndividualAudio, 'japanese')
    : getAudioURL(title, 'japanese');

  return (
    <div>
      <SentenceBlock
        thisSentencesWordsState={[]}
        sentence={contextData}
        // sentenceIndex={1}
        handleMouseLeave={() => {}}
        handleMouseEnter={() => {}}
        wordPopUpState={[]}
        setWordPopUpState={() => {}}
        handleDeleteWordDataProvider={() => {}}
        wordsState={[]}
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
