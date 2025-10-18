import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { Button } from '@/components/ui/button';

const WordsStudyUIAudioElFallback = ({ contextDataEl }) => {
  const { ref, isVideoPlaying, handlePause, handlePlayFromHere } =
    useWordsStudyUIScreen();

  const audioUrl = getAudioURL(contextDataEl.title, 'japanese');

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
};

export default WordsStudyUIAudioElFallback;
