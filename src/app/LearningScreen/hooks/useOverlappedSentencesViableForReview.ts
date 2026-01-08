import { useMemo } from 'react';
import { getSecondsLoopedTranscriptData } from '../utils/get-seconds-looped-transcript-data';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '../../types/content-types';
import { OverlappingSnippetData } from '../../types/shared-types';
import { accumulateSentenceOverlap } from '../utils/accumulate-sentence-overlap';

export const useOverlappedSentencesViableForReview = (
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
  return useMemo(() => {
    const contentSnippets = snippets;
    if (!contentSnippets || contentSnippets?.length === 0) {
      return null;
    }

    const allSentenceIntervals = [] as OverlappingSnippetData[];

    contentSnippets.forEach((snippetEl) => {
      const snippetTime = snippetEl.time;
      const snippetIsContracted = snippetEl.isContracted;

      const snippetStartTime = snippetTime - (snippetIsContracted ? 0.75 : 1.5);
      const snippetEndTime = snippetTime + (snippetIsContracted ? 0.75 : 1.5);
      const overlappingSentenceData = getSecondsLoopedTranscriptData({
        formattedTranscriptState: getLoopTranscriptSegment({
          startTime: snippetStartTime,
          endTime: snippetEndTime,
        }),
        loopStartTime: snippetStartTime,
        loopEndTime: snippetEndTime,
        mediaDuration,
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

    const allOverlappingDataReviewEligible =
      accumulateSentenceOverlap(allSentenceIntervals);

    return Object.keys(allOverlappingDataReviewEligible);
  }, [
    snippets,
    sentenceMapMemoized,
    formattedTranscriptMemoized,
    mediaDuration,
    getLoopTranscriptSegment,
  ]);
};
