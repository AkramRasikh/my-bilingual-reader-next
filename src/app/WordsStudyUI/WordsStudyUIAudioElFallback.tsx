import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { useEffect } from 'react';
import useData from '../Providers/useData';
import WordStudyUITranscriptItem from './WordStudyUITranscriptItem';

const WordsStudyUIAudioElFallback = ({
  secondsState,
  contextDataEl,
  languageSelectedState,
}) => {
  const {
    ref,
    isVideoPlaying,
    handlePause,
    handlePlayFromHere,
    setIsVideoPlaying,
    handleTimeUpdate,
    overlappingSnippetDataState,
  } = useWordsStudyUIScreen();

  const { wordsState, handleSaveWord, handleDeleteWordDataProvider } =
    useData();

  const audioUrl = getAudioURL(contextDataEl.title, languageSelectedState);
  const currentTime = ref?.current?.currentTime;
  const masterPlay =
    secondsState?.length > 0 ? secondsState[Math.floor(currentTime)] : '';

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleAudio = (currentContext, contextTime) => {
    const currentContextIsMaster = currentContext === masterPlay;

    if (currentContextIsMaster) {
      isVideoPlaying ? handlePause() : handlePlayFromHere(contextTime); // issue of has video vs no video on realStartTime
    } else {
      handlePlayFromHere(contextTime);
    }
  };

  const transcriptArr = [
    contextDataEl?.previousSentence,
    contextDataEl,
    contextDataEl?.nextSentence,
  ].filter((item) => item);

  return (
    <div>
      <div className='flex gap-3 mb-2'>
        <audio
          ref={ref}
          src={audioUrl}
          controls
          className='w-full'
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className='flex flex-col gap-2'>
        {transcriptArr?.map((transcriptItem, index) => {
          return (
            <div key={index}>
              <WordStudyUITranscriptItem
                masterPlay={masterPlay}
                transcriptItem={transcriptItem}
                overlappingSnippetDataState={overlappingSnippetDataState}
                handleSaveWord={handleSaveWord}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                wordsState={wordsState}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleAudio={handleAudio}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordsStudyUIAudioElFallback;
