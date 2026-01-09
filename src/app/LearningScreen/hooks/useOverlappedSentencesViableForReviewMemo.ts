import { useMemo } from 'react';
import { getSecondsLoopedTranscriptData } from '../utils/get-seconds-looped-transcript-data';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '../../types/content-types';
import { OverlappingSnippetData } from '../../types/shared-types';

export const useOverlappedSentencesViableForReviewMemo = (
  snippets: Snippet[] | undefined,
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>,
  formattedTranscriptMemoized: FormattedTranscriptTypes[],
  mediaDuration: number | null,
  getLoopTranscriptSegment: ({
    startTime,
    endTime,
  }: {
    startTime: number;
    endTime: number;
  }) => FormattedTranscriptTypes[],
) => {
  const contentSnippets = snippets;
  return useMemo(() => {
    if (!contentSnippets || contentSnippets?.length === 0) {
      return null;
    }

    const allSentenceIntervals = [] as OverlappingSnippetData[];

    contentSnippets.forEach((snippetEl) => {
      const snippetTime = snippetEl.time;
      const snippetIsContracted = snippetEl.isContracted;

      const snippetStartTime = snippetTime - (snippetIsContracted ? 0.75 : 1.5);
      const snippetEndTime = snippetTime + (snippetIsContracted ? 0.75 : 1.5);

      const formattedSnippedTranscriptSegment = getLoopTranscriptSegment({
        startTime: snippetStartTime,
        endTime: snippetEndTime,
      });
      const overlappingSentenceData = getSecondsLoopedTranscriptData({
        formattedTranscriptState: formattedSnippedTranscriptSegment,
        loopStartTime: snippetStartTime,
        loopEndTime: snippetEndTime,
        mediaDuration,
        includeSecondsArrays: true,
      });

      if (!overlappingSentenceData) {
        return;
      }
      overlappingSentenceData.forEach((item) => {
        const sentenceIsUpForReview =
          sentenceMapMemoized[item.id].isUpForReview;
        if (!sentenceIsUpForReview) {
          allSentenceIntervals.push(item);
        }
      });
    });

    if (allSentenceIntervals.length === 0) {
      return null;
    }

    // Build coverage map: track which seconds are NOT overlapped
    const sentenceCoverageMap: Record<
      string,
      {
        sentenceSeconds: number[];
        secondsNotOverlapped: Set<number>;
      }
    > = {};

    allSentenceIntervals.forEach((item) => {
      // Initialize if doesn't exist
      if (!sentenceCoverageMap[item.id]) {
        sentenceCoverageMap[item.id] = {
          sentenceSeconds: item.sentenceSeconds || [],
          secondsNotOverlapped: new Set(item.sentenceSeconds || []), // Start with all seconds as "not overlapped"
        };
      }

      // Remove overlapped seconds from the "not overlapped" set
      item.overlappedSeconds?.forEach((second) => {
        sentenceCoverageMap[item.id].secondsNotOverlapped.delete(second);
      });
    });

    // Filter to sentences where >50% is overlapped
    const viableSentenceIds: string[] = [];

    for (const [
      sentenceId,
      { sentenceSeconds, secondsNotOverlapped },
    ] of Object.entries(sentenceCoverageMap)) {
      const totalSeconds = sentenceSeconds.length;
      const notOverlappedCount = secondsNotOverlapped.size;
      const overlappedCount = totalSeconds - notOverlappedCount;
      const overlapPercentage = (overlappedCount / totalSeconds) * 100;

      if (overlapPercentage > 50) {
        viableSentenceIds.push(sentenceId);
      }
    }

    return viableSentenceIds;
  }, [
    formattedTranscriptMemoized,
    contentSnippets,
    sentenceMapMemoized,
    mediaDuration,
    getLoopTranscriptSegment,
  ]);
};
