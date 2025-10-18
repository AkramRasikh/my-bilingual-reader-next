import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const WordsStudyUIAudioElFallback = ({ contextDataEl }) => {
  const {
    ref,
    isVideoPlaying,
    handlePause,
    handlePlayFromHere,
    setIsVideoPlaying,
  } = useWordsStudyUIScreen();

  const audioUrl = getAudioURL(contextDataEl.title, 'japanese');

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

  return (
    <div>
      <div className='flex gap-3'>
        <audio ref={ref} src={audioUrl} controls className='w-full' />
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
      <div className='backdrop-blur-xs backdrop-brightness-75  p-1 m-1 rounded-lg'>
        {contextDataEl?.previousSentence && (
          <p className='text-center font-bold text-lg italic text-gray-700'>
            {contextDataEl.previousSentence}
          </p>
        )}
        {contextDataEl?.targetLang && (
          <p className='text-center font-bold text-xl text-blue-900'>
            {contextDataEl.targetLang}
          </p>
        )}
        {contextDataEl?.nextSentence && (
          <p className='text-center font-bold text-lg italic text-gray-700'>
            {contextDataEl.nextSentence}
          </p>
        )}
      </div>
      <p className='text-sm font-medium italic my-auto text-right'>
        {contextDataEl.title}
      </p>
    </div>
  );
};

export default WordsStudyUIAudioElFallback;
