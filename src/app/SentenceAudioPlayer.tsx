import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration || 0);
    audio.addEventListener('loadedmetadata', setAudioData);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
    };
  }, []);

  // Smooth progress updater
  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setProgress(audio.currentTime);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      audio.play();
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setProgress(value[0]);
  };

  return (
    <div className='flex items-center gap-4 w-full max-w-md m-auto'>
      <Slider
        value={[progress]}
        min={0}
        max={duration || 0}
        step={0.01}
        className='flex-1'
        onValueChange={handleSeek}
      />
      <audio ref={audioRef} src={src} preload='metadata' />
      <Button size='icon' variant='outline' onClick={togglePlay}>
        {isPlaying ? (
          <Pause className='h-5 w-5' />
        ) : (
          <Play className='h-5 w-5' />
        )}
      </Button>
    </div>
  );
}
