'use client';

import { useMemo } from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Marker = {
  id: string | number;
  text: string;
  time: number; // in seconds
};

interface TranscriptTimelineProps {
  sentences?: Marker[];
  words?: Marker[];
  videoDuration: number; // in seconds
  onSelectSentence?: (sentence: Marker) => void;
  onSelectWord?: (word: Marker) => void;
}

export default function TranscriptTimeline({
  sentences = [],
  words = [],
  videoDuration,
  onSelectSentence,
  onSelectWord,
}: TranscriptTimelineProps) {
  // Normalize positions
  const sentencePositions = useMemo(
    () =>
      sentences.map((s) => ({
        ...s,
        position: Math.min(Math.max(s.time / videoDuration, 0), 1),
      })),
    [sentences, videoDuration],
  );

  const wordPositions = useMemo(
    () =>
      words.map((w) => ({
        ...w,
        position: Math.min(Math.max(w.time / videoDuration, 0), 1),
      })),
    [words, videoDuration],
  );

  return (
    <TooltipProvider delayDuration={50}>
      <div className='relative w-full h-20 flex items-center'>
        {/* Base timeline line */}
        <div className='absolute left-0 right-0 top-1/2 h-[2px] bg-muted rounded-full' />

        {/* Sentence markers (sprout UP) */}
        {sentencePositions.map((sentence) => (
          <Tooltip key={`sentence-${sentence.id}`}>
            <TooltipTrigger asChild>
              <div
                onClick={() => onSelectSentence?.(sentence)}
                className={cn(
                  'absolute bottom-1/2 w-[2px] h-6 bg-primary hover:bg-primary/70 rounded-full cursor-pointer transition-colors',
                )}
                style={{ left: `${sentence.position * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side='top'>
              <div className='text-sm max-w-xs'>
                <strong>{formatTime(sentence.time)}</strong>
                <div className='text-muted-foreground'>{sentence.text}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Word markers (sprout DOWN) */}
        {wordPositions.map((word) => (
          <Tooltip key={`word-${word.id}`}>
            <TooltipTrigger asChild>
              <div
                onClick={() => onSelectWord?.(word)}
                className={cn(
                  'absolute top-1/2 w-[1.5px] h-4 bg-secondary hover:bg-secondary/70 rounded-full cursor-pointer transition-colors',
                )}
                style={{ left: `${word.position * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <div className='text-sm max-w-xs'>
                <strong>{formatTime(word.time)}</strong>
                <div className='text-muted-foreground'>{word.text}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
