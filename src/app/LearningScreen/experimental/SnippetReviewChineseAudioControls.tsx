import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { PauseIcon, PlayIcon, RabbitIcon } from 'lucide-react';
import React from 'react';

interface SnippetReviewChineseAudioControlsProps {
  thisIsPlaying: boolean;
  handlePlaySnippet: () => void;
  isPreSnippet?: boolean;
}

const SnippetReviewChineseAudioControls: React.FC<SnippetReviewChineseAudioControlsProps> = ({
  thisIsPlaying,
  handlePlaySnippet,
  isPreSnippet,
}) => (
  <div className='flex flex-col gap-2'>
    <Button
      className={clsx(
        'h-7 w-7',
        thisIsPlaying ? 'bg-amber-300' : '',
      )}
      onClick={handlePlaySnippet}
    >
      {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
    </Button>
    {isPreSnippet && (
      <RabbitIcon className='fill-amber-300 rounded m-auto mt-0' />
    )}
  </div>
);

export default SnippetReviewChineseAudioControls;