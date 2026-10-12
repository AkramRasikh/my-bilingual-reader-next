import {
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';
import { getSnippetTimeRange } from '../learning-screen-review-time-range';
import { getSecondsLoopedTranscriptData } from './get-seconds-looped-transcript-data';

export const SNIPPET_COVERAGE_THRESHOLD = 50;

export type GetLoopTranscriptSegment = (args: {
  startTime: number;
  endTime: number;
}) => SentenceMapItemTypes[];

export type SentenceSnippetCoverageResult = {
  hasIntervals: boolean;
  sentenceIdsAboveThreshold: string[];
};

type SentenceCoverageEntry = {
  sentenceSeconds: number[];
  secondsNotOverlapped: Set<number>;
};

const collectSentenceIntervals = ({
  snippets,
  sentenceMap,
  mediaDuration,
  getLoopTranscriptSegment,
  excludeSentencesUpForReview,
}: {
  snippets: Snippet[];
  sentenceMap: Record<string, SentenceMapItemTypes>;
  mediaDuration: number | null;
  getLoopTranscriptSegment: GetLoopTranscriptSegment;
  excludeSentencesUpForReview: boolean;
}): OverlappingSnippetData[] => {
  const allSentenceIntervals: OverlappingSnippetData[] = [];

  snippets.forEach((snippetEl) => {
    if (!snippetEl?.reviewData?.due) {
      return;
    }

    const { startTime, endTime } = getSnippetTimeRange(snippetEl);
    const formattedSnippedTranscriptSegment = getLoopTranscriptSegment({
      startTime,
      endTime,
    });
    const overlappingSentenceData = getSecondsLoopedTranscriptData({
      formattedTranscriptState: formattedSnippedTranscriptSegment,
      loopStartTime: startTime,
      loopEndTime: endTime,
      mediaDuration,
      includeSecondsArrays: true,
    });

    if (!overlappingSentenceData) {
      return;
    }

    overlappingSentenceData.forEach((item) => {
      if (
        excludeSentencesUpForReview &&
        sentenceMap[item.id].isUpForReview
      ) {
        return;
      }
      allSentenceIntervals.push(item);
    });
  });

  return allSentenceIntervals;
};

const sentenceIdsAboveCoverageThreshold = (
  allSentenceIntervals: OverlappingSnippetData[],
): string[] => {
  const sentenceCoverageMap: Record<string, SentenceCoverageEntry> = {};

  allSentenceIntervals.forEach((item) => {
    if (!sentenceCoverageMap[item.id]) {
      sentenceCoverageMap[item.id] = {
        sentenceSeconds: item.sentenceSeconds || [],
        secondsNotOverlapped: new Set(item.sentenceSeconds || []),
      };
    }

    item.overlappedSeconds?.forEach((second) => {
      sentenceCoverageMap[item.id].secondsNotOverlapped.delete(second);
    });
  });

  const viableSentenceIds: string[] = [];

  for (const [
    sentenceId,
    { sentenceSeconds, secondsNotOverlapped },
  ] of Object.entries(sentenceCoverageMap)) {
    const totalSeconds = sentenceSeconds.length;
    const overlappedCount = totalSeconds - secondsNotOverlapped.size;
    const overlapPercentage = (overlappedCount / totalSeconds) * 100;

    if (overlapPercentage > SNIPPET_COVERAGE_THRESHOLD) {
      viableSentenceIds.push(sentenceId);
    }
  }

  return viableSentenceIds;
};

export const getSentenceSnippetCoverage = ({
  snippets,
  sentenceMap,
  mediaDuration,
  getLoopTranscriptSegment,
  excludeSentencesUpForReview = false,
}: {
  snippets: Snippet[] | undefined;
  sentenceMap: Record<string, SentenceMapItemTypes>;
  mediaDuration: number | null;
  getLoopTranscriptSegment: GetLoopTranscriptSegment;
  excludeSentencesUpForReview?: boolean;
}): SentenceSnippetCoverageResult => {
  if (!snippets || snippets.length === 0) {
    return { hasIntervals: false, sentenceIdsAboveThreshold: [] };
  }

  const allSentenceIntervals = collectSentenceIntervals({
    snippets,
    sentenceMap,
    mediaDuration,
    getLoopTranscriptSegment,
    excludeSentencesUpForReview,
  });

  if (allSentenceIntervals.length === 0) {
    return { hasIntervals: false, sentenceIdsAboveThreshold: [] };
  }

  return {
    hasIntervals: true,
    sentenceIdsAboveThreshold: sentenceIdsAboveCoverageThreshold(
      allSentenceIntervals,
    ),
  };
};

export const getAutoBreakdownSentenceIds = ({
  snippets,
  newSnippet,
  sentenceMap,
  mediaDuration,
  getLoopTranscriptSegment,
}: {
  snippets: Snippet[];
  newSnippet: Pick<Snippet, 'time' | 'isContracted'>;
  sentenceMap: Record<string, SentenceMapItemTypes>;
  mediaDuration: number | null;
  getLoopTranscriptSegment: GetLoopTranscriptSegment;
}): string[] => {
  const { startTime, endTime } = getSnippetTimeRange(newSnippet);
  const overlappedByNewSnippet = getSecondsLoopedTranscriptData({
    formattedTranscriptState: getLoopTranscriptSegment({ startTime, endTime }),
    loopStartTime: startTime,
    loopEndTime: endTime,
    mediaDuration,
  });
  const touchedSentenceIds = new Set(
    overlappedByNewSnippet.map((item) => item.id),
  );

  if (touchedSentenceIds.size === 0) {
    return [];
  }

  const { sentenceIdsAboveThreshold } = getSentenceSnippetCoverage({
    snippets,
    sentenceMap,
    mediaDuration,
    getLoopTranscriptSegment,
    excludeSentencesUpForReview: false,
  });

  return sentenceIdsAboveThreshold.filter(
    (sentenceId) =>
      touchedSentenceIds.has(sentenceId) &&
      !sentenceMap[sentenceId]?.sentenceStructure,
  );
};
