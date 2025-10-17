import { getAudioURL, getCloudflareVideoURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SentenceBlock from '@/components/custom/SentenceBlock';
import VideoPlayer from '../VideoPlayer';

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

const WordsStudyUIMediaElement = () => {
  const {
    formattedWordsStudyState,
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
  } = useWordsStudyUIScreen();

  const firstEl = formattedWordsStudyState[0];
  const contextData = firstEl.contextData;

  return (
    <div>
      {contextData.map((contextDataEl, index) => {
        const isMedia = contextDataEl.isMedia;

        if (isMedia) {
          const videoUrl = getCloudflareVideoURL(
            contextDataEl.generalTopicName,
            'japanese',
          );

          return (
            <VideoPlayer
              key={index}
              ref={ref}
              url={videoUrl}
              setIsVideoPlaying={setIsVideoPlaying}
              isVideoPlaying={isVideoPlaying}
              masterPlayComprehensiveState={contextDataEl}
              playFromHereUI={() =>
                isVideoPlaying
                  ? handlePause()
                  : handlePlayFromHere(
                      contextDataEl.realStartTime + contextDataEl.time,
                    )
              }
            />
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
