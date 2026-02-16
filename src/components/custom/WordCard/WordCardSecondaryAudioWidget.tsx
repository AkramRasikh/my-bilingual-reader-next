import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LucidePause, LucidePlay } from 'lucide-react';
import { getAudioURL } from '@/utils/get-media-url';

interface WordCardSecondaryAudioWidgetProps {
  audioSrc: string;
  testId?: string;
  language: string; // e.g., 'arabic', 'chinese', etc.
  getSentenceFromContextId: (
    contextId: string,
    isAdditionalContext?: boolean,
  ) => string | null; // function to get sentence from context ID
}

const WordCardSecondaryAudioWidget = ({
  audioSrc,
  testId,
  language,
  getSentenceFromContextId,
}: WordCardSecondaryAudioWidgetProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioUrl = getAudioURL(audioSrc, language);

  const targetLangSentence = getSentenceFromContextId(audioSrc, true);

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
    <div className='relative'>
      {isPlaying && targetLangSentence && (
        <div className='absolute text-sm text-gray-600 w-max-content -left-75 -top-5'>
          {targetLangSentence}
        </div>
      )}
      <Button
        variant={'secondary'}
        className={'h-3 w-3 p-3 bg-blue-200'}
        onClick={handlePlayPause}
        data-testid={testId}
      >
        {isPlaying ? <LucidePause /> : <LucidePlay />}
      </Button>
    </div>
  );
};

export default WordCardSecondaryAudioWidget;
