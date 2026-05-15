import { SentenceMapItemTypes, Snippet } from '@/app/types/content-types';

export function getSnippetTimeRange(snippet: Pick<Snippet, 'time' | 'isContracted'>) {
  const padding = snippet.isContracted ? 0.75 : 1.5;
  return {
    startTime: snippet.time - padding,
    endTime: snippet.time + padding,
  };
}

export function getSentenceTimeRange(
  sentence: Pick<SentenceMapItemTypes, 'time' | 'nextSentence'>,
  mediaDuration: number | null,
) {
  return {
    startTime: sentence.time,
    endTime: sentence.nextSentence ?? mediaDuration,
  };
}

export function isCurrentTimeBeyondRange(
  currentTime: number,
  endTime: number | null | undefined,
): boolean {
  if (endTime == null || !Number.isFinite(endTime)) {
    return false;
  }
  return currentTime > endTime;
}
