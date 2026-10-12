import { useMemo } from 'react';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '../../types/content-types';
import { getSentenceSnippetCoverage } from '../utils/get-sentence-snippet-coverage';

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
  }) => SentenceMapItemTypes[],
) => {
  return useMemo(() => {
    if (!snippets || snippets.length === 0) {
      return null;
    }

    const { hasIntervals, sentenceIdsAboveThreshold } =
      getSentenceSnippetCoverage({
        snippets,
        sentenceMap: sentenceMapMemoized,
        mediaDuration,
        getLoopTranscriptSegment,
        excludeSentencesUpForReview: true,
      });

    if (!hasIntervals) {
      return null;
    }

    return sentenceIdsAboveThreshold;
  }, [
    formattedTranscriptMemoized,
    snippets,
    sentenceMapMemoized,
    mediaDuration,
    getLoopTranscriptSegment,
  ]);
};
