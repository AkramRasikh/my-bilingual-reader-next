import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { PauseIcon, PlayIcon, RabbitIcon } from 'lucide-react';
import React from 'react';
import SnippetReviewChineseBreakdownWidgets from './SnippetReviewBreakdownWidgets';

interface SnippetReviewChineseAudioControlsProps {
  thisIsPlaying: boolean;
  handlePlaySnippet: () => void;
  isPreSnippet?: boolean;
  sentencesToBreakdown?: Array<{
    sentenceId: string;
    startIndex: number;
    surfaceForm?: string;
  }>;
  isBreakingDownSentenceArrState?: string[];
  handleBreakdownSentence: (arg: { sentenceId: string }) => Promise<void>;
}

const SnippetReviewChineseAudioControls: React.FC<
  SnippetReviewChineseAudioControlsProps
> = ({
  thisIsPlaying,
  handlePlaySnippet,
  isPreSnippet,
  sentencesToBreakdown,
  isBreakingDownSentenceArrState,
  handleBreakdownSentence,
}) => (
  <div className='flex flex-col gap-2'>
    <Button
      className={clsx('h-7 w-7', thisIsPlaying ? 'bg-amber-300' : '')}
      onClick={handlePlaySnippet}
    >
      {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
    </Button>
    {isPreSnippet && (
      <RabbitIcon className='fill-amber-300 rounded m-auto mt-0 mb-1' />
    )}
    {sentencesToBreakdown?.length > 0 && (
      <SnippetReviewChineseBreakdownWidgets
        sentencesToBreakdown={sentencesToBreakdown}
        isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
        handleBreakdownSentence={handleBreakdownSentence}
      />
    )}
  </div>
);

export default SnippetReviewChineseAudioControls;
