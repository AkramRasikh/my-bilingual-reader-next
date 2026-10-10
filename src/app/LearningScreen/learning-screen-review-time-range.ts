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

export type ReviewTimeRangePhase = 'before' | 'during' | 'beyond';

export function getCurrentTimeRangePhase(
  currentTime: number,
  startTime: number | null | undefined,
  endTime: number | null | undefined,
): ReviewTimeRangePhase | null {
  const hasStart = startTime != null && Number.isFinite(startTime);
  const hasEnd = endTime != null && Number.isFinite(endTime);

  if (!hasStart && !hasEnd) {
    return null;
  }

  if (hasStart && currentTime < startTime) {
    return 'before';
  }

  if (hasEnd && currentTime > endTime) {
    return 'beyond';
  }

  if (hasStart || hasEnd) {
    return 'during';
  }

  return null;
}

export function getTimeRangeProgress(
  currentTime: number,
  startTime: number | null | undefined,
  endTime: number | null | undefined,
): number {
  if (!Number.isFinite(currentTime)) {
    return 0;
  }

  const start = startTime != null && Number.isFinite(startTime) ? startTime : null;
  const end = endTime != null && Number.isFinite(endTime) ? endTime : null;

  if (start == null || end == null || end <= start) {
    return getCurrentTimeRangePhase(currentTime, startTime, endTime) === 'beyond'
      ? 1
      : 0;
  }

  if (currentTime <= start) {
    return 0;
  }

  if (currentTime >= end) {
    return 1;
  }

  return (currentTime - start) / (end - start);
}

export function isCurrentTimeBeyondRange(
  currentTime: number,
  endTime: number | null | undefined,
): boolean {
  return getCurrentTimeRangePhase(currentTime, null, endTime) === 'beyond';
}
