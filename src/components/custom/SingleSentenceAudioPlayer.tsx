import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const SingleSentenceAudioPlayer = ({
  src,
  audioProgressState,
  setAudioProgressState,
  audioRef,
  setIsPlayingState,
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlayingState(true);
    const handlePause = () => setIsPlayingState(false);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setAudioProgressState(value[0]);
  };

  return (
    <div className={'flex items-center gap-4 w-full'}>
      <Slider
        value={[audioProgressState]}
        min={0}
        max={duration || 0}
        step={0.01}
        className='flex-1'
        onValueChange={handleSeek}
      />
      <audio ref={audioRef} src={src} preload='metadata' />
    </div>
  );
};

export default SingleSentenceAudioPlayer;
