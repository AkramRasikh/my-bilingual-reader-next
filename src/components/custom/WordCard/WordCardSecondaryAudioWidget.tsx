import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LucidePause, LucidePlay } from 'lucide-react';
import { getAudioURL } from '@/utils/get-media-url';

interface WordCardSecondaryAudioWidgetProps {
  audioSrc: string;
  testId?: string;
  language: string; // e.g., 'arabic', 'chinese', etc.
}

const WordCardSecondaryAudioWidget = ({
  audioSrc,
  testId,
  language,
}: WordCardSecondaryAudioWidgetProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioUrl = getAudioURL(audioSrc, language);
  const handlePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Button
      variant={'secondary'}
      className={'h-3 w-3 p-3 bg-blue-200'}
      onClick={handlePlayPause}
      data-testid={testId}
    >
      {isPlaying ? <LucidePause /> : <LucidePlay />}
    </Button>
  );
};

export default WordCardSecondaryAudioWidget;
