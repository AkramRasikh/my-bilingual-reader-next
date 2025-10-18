import { getAudioURL, getCloudflareVideoURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SentenceBlock from '@/components/custom/SentenceBlock';
import VideoPlayer from '../VideoPlayer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
  const [error, setError] = useState(null);
  const {
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
  } = useWordsStudyUIScreen();

  useEffect(() => {
    const video = ref.current;

    if (!video) return;

    // Handle video load error
    const handleError = () => {
      const errorMessage =
        video.error?.message ||
        `Video failed to load (code: ${video.error?.code || 'unknown'})`;
      setError(errorMessage);
    };

    // Attach listener
    video.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      video.removeEventListener('error', handleError);
    };
  }, []);

  const audioUrl = getAudioURL(contextDataEl.title, 'japanese');

  const isMedia = contextDataEl.isMedia;

  if (error) {
    return (
      <div>
        <div className='flex gap-3'>
          <div>
            <audio ref={ref} src={audioUrl} controls />
          </div>
          <Button
            className='my-auto'
            onClick={() =>
              isVideoPlaying
                ? handlePause()
                : handlePlayFromHere(contextDataEl.time)
            }
          >
            {isVideoPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
        {contextDataEl?.targetLang && (
          <p className='text-center font-bold text-xl text-blue-900  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
            {contextDataEl.targetLang}
          </p>
        )}
      </div>
    );
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
  const {
    formattedWordsStudyState,
    ref,

    selectedElState,
  } = useWordsStudyUIScreen();

  const selectedEl = formattedWordsStudyState[selectedElState];
  const contextData = selectedEl.contextData;

  if (!Boolean(contextData?.length)) {
    return <span>No context</span>;
  }

  console.log('## ref', ref.current);

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
