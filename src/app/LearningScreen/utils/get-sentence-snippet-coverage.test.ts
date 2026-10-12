import { describe, expect, it } from '@jest/globals';
import { SentenceMapItemTypes, Snippet } from '@/app/types/content-types';
import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';
import { getLoopTranscriptSegment as getLoopTranscriptSegmentFromTimes } from './get-loop-transcript-segment';
import {
  getAutoBreakdownSentenceIds,
  getSentenceSnippetCoverage,
} from './get-sentence-snippet-coverage';

const mediaDuration = 20;

const sentence = (
  id: string,
  time: number,
  nextSentence: number,
  extras: Partial<SentenceMapItemTypes> = {},
): SentenceMapItemTypes =>
  ({
    id,
    time,
    nextSentence,
    targetLang: id,
    baseLang: id,
    index: 0,
    prevSentence: null,
    thisSentence: time,
    isUpForReview: false,
    isDue: false,
    targetLangformatted: [],
    helperReviewSentence: false,
    ...extras,
  }) as SentenceMapItemTypes;

const dueSnippet = (
  id: string,
  time: number,
  isContracted = false,
): Snippet =>
  ({
    id,
    time,
    isContracted,
    baseLang: '',
    targetLang: '',
    reviewData: { due: new Date('2026-01-01') },
  }) as Snippet;

const buildSegmentLookup = (sentences: SentenceMapItemTypes[]) => {
  const sentenceMap = Object.fromEntries(
    sentences.map((item) => [item.id, item]),
  );
  const secondsState = mapSentenceIdsToSeconds({
    content: sentences.map((item) => ({ id: item.id, time: item.time })),
    duration: mediaDuration,
  });

  return {
    sentenceMap,
    getLoopTranscriptSegment: ({
      startTime,
      endTime,
    }: {
      startTime: number;
      endTime: number;
    }) =>
      getLoopTranscriptSegmentFromTimes({
        secondsState,
        sentenceMap,
        startTime,
        endTime,
      }),
  };
};

describe('getSentenceSnippetCoverage', () => {
  const sentences = [sentence('s1', 0, 10), sentence('s2', 10, 20)];
  const { sentenceMap, getLoopTranscriptSegment } = buildSegmentLookup(sentences);

  it('stays at or below 50% until later snippets push coverage over the threshold', () => {
    const firstSnippet = dueSnippet('a', 1.5);
    const partial = getSentenceSnippetCoverage({
      snippets: [firstSnippet],
      sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment,
    });

    expect(partial.sentenceIdsAboveThreshold).toEqual([]);

    const exactlyHalf = getSentenceSnippetCoverage({
      snippets: [firstSnippet, dueSnippet('b', 4)],
      sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment,
    });

    expect(exactlyHalf.sentenceIdsAboveThreshold).toEqual([]);

    const overHalf = getSentenceSnippetCoverage({
      snippets: [firstSnippet, dueSnippet('c', 4.5)],
      sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment,
    });

    expect(overHalf.sentenceIdsAboveThreshold).toEqual(['s1']);
  });

  it('ignores snippets that are not up for review', () => {
    const withoutReview = {
      ...dueSnippet('a', 1.5),
      reviewData: undefined,
    };
    const covering = dueSnippet('c', 4.5);

    const result = getSentenceSnippetCoverage({
      snippets: [withoutReview, covering],
      sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment,
    });

    expect(result.sentenceIdsAboveThreshold).toEqual([]);
  });

  it('excludes sentences already up for review only when asked', () => {
    const snippets = [dueSnippet('a', 1.5), dueSnippet('c', 4.5)];
    const upForReview = buildSegmentLookup([
      sentence('s1', 0, 10, { isUpForReview: true }),
      sentence('s2', 10, 20),
    ]);

    const included = getSentenceSnippetCoverage({
      snippets,
      sentenceMap: upForReview.sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment: upForReview.getLoopTranscriptSegment,
      excludeSentencesUpForReview: false,
    });
    const excluded = getSentenceSnippetCoverage({
      snippets,
      sentenceMap: upForReview.sentenceMap,
      mediaDuration,
      getLoopTranscriptSegment: upForReview.getLoopTranscriptSegment,
      excludeSentencesUpForReview: true,
    });

    expect(included.sentenceIdsAboveThreshold).toEqual(['s1']);
    expect(excluded.hasIntervals).toBe(false);
    expect(excluded.sentenceIdsAboveThreshold).toEqual([]);
  });
});

describe('getAutoBreakdownSentenceIds', () => {
  const sentences = [sentence('s1', 0, 10), sentence('s2', 10, 20)];
  const { sentenceMap, getLoopTranscriptSegment } = buildSegmentLookup(sentences);
  const coveredSentence = [dueSnippet('a', 1.5), dueSnippet('c', 4.5)];

  it('breaks down only the newly overlapped sentence once coverage is above 50%', () => {
    const newSnippet = coveredSentence[1];

    expect(
      getAutoBreakdownSentenceIds({
        snippets: [coveredSentence[0]],
        newSnippet,
        sentenceMap,
        mediaDuration,
        getLoopTranscriptSegment,
      }),
    ).toEqual([]);

    expect(
      getAutoBreakdownSentenceIds({
        snippets: coveredSentence,
        newSnippet,
        sentenceMap,
        mediaDuration,
        getLoopTranscriptSegment,
      }),
    ).toEqual(['s1']);
  });

  it('ignores sentences the new snippet does not touch', () => {
    const newSnippet = dueSnippet('far', 15);

    expect(
      getAutoBreakdownSentenceIds({
        snippets: [...coveredSentence, newSnippet],
        newSnippet,
        sentenceMap,
        mediaDuration,
        getLoopTranscriptSegment,
      }),
    ).toEqual([]);
  });

  it('skips sentences that already have a breakdown', () => {
    const withBreakdown = buildSegmentLookup([
      sentence('s1', 0, 10, { sentenceStructure: 'already + broken' }),
      sentence('s2', 10, 20),
    ]);

    expect(
      getAutoBreakdownSentenceIds({
        snippets: coveredSentence,
        newSnippet: coveredSentence[1],
        sentenceMap: withBreakdown.sentenceMap,
        mediaDuration,
        getLoopTranscriptSegment: withBreakdown.getLoopTranscriptSegment,
      }),
    ).toEqual([]);
  });
});
