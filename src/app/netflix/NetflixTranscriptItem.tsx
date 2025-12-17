'use client';

import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { PauseCircleIcon, PlayIcon } from 'lucide-react';

interface NetflixTranscriptItemProps {
  item: {
    id: string;
    targetLang: string;
    baseLang: string;
    time: number;
  };
  index: number;
  thisIsPlaying: boolean;
  isVideoPlaying: boolean;
  handlePause: () => void;
  playFromHere: (time: number) => void;
}

const NetflixTranscriptItem = ({
  item,
  index,
  thisIsPlaying,
  isVideoPlaying,
  handlePause,
  playFromHere,
}: NetflixTranscriptItemProps) => {
  return (
    <div
      className={clsx(
        'flex items-start space-x-4 border p-2 rounded-md',
        thisIsPlaying ? 'bg-yellow-200' : 'bg-background',
      )}
    >
      <div className='flex flex-col gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={() =>
            isVideoPlaying && thisIsPlaying
              ? handlePause()
              : playFromHere(item.time)
          }
        >
          {isVideoPlaying && thisIsPlaying ? (
            <PauseCircleIcon className='h-4 w-4' />
          ) : (
            <PlayIcon className='h-4 w-4' />
          )}
        </Button>
      </div>
      <div className='flex-1 flex flex-col space-y-1'>
        <div className='w-full'>
          <span className='text-sm'>
            {index + 1}) {item.targetLang}
          </span>
        </div>
        <div className='text-sm text-muted-foreground'>{item.baseLang}</div>
      </div>
      <div className='flex-shrink-0 text-xs font-mono text-gray-600'>
        {item.time}s
      </div>
    </div>
  );
};

export default NetflixTranscriptItem;
