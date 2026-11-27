import { describe, it, expect } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { SentenceMapItemTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { useSnippetDueMemoized } from '../hooks/useSnippetDueMemoized';
import { useSavedSnippetsMemoized } from '../hooks/useSavedSnippetsMemoized';
import { filterWordsForCustomSnippetReview } from '../hooks/useComprehensiveReviewModeData';

const past = new Date('2020-01-01');

const regularDue = {
  id: 'regular',
  time: 5,
  targetLang: 'on va au parc',
  baseLang: 'we go to the park',
  reviewData: { due: past },
} as unknown as Snippet;

// A Netflix-synced record could, in principle, carry reviewData; it must
// still never be due or drawn as a 3 s snippet.
const sentenceClip = {
  id: 'clip',
  time: 6,
  start: 5,
  end: 7,
  sentenceId: 's1',
  origin: 'sentence',
  isContracted: false,
  isPreSnippet: false,
  targetLang: 'on va au parc',
  baseLang: 'we go to the park',
  focusedText: 'parc',
  reviewData: { due: past },
} as unknown as Snippet;

const transcript = [
  {
    id: 's1',
    time: 0,
    nextSentence: 10,
    targetLang: 'on va au parc',
    baseLang: 'we go to the park',
    index: 0,
    prevSentence: null,
    thisSentence: 0,
    isUpForReview: true,
    isDue: true,
    targetLangformatted: [],
    helperReviewSentence: false,
  },
] as SentenceMapItemTypes[];

describe('custom sentence snippets stay out of the snippet machinery', () => {
  it('are never due', () => {
    const { result } = renderHook(() =>
      useSnippetDueMemoized({
        snippetsWithVocab: [regularDue, sentenceClip],
        enableSnippetReviewState: true,
      }),
    );
    expect(result.current.snippetsWithDueStatusMemoized.map((s) => s.id)).toEqual(
      ['regular'],
    );
    expect(result.current.earliestSnippetDueTime).toBe(5);
  });

  it('are not drawn as saved 3 s snippets', () => {
    const { result } = renderHook(() =>
      useSavedSnippetsMemoized([regularDue, sentenceClip], transcript),
    );
    const ids = result.current.overlappingSnippetElements.map(
      (item) => item.snippetId,
    );
    expect(ids).toContain('regular');
    expect(ids).not.toContain('clip');
    expect(result.current.snippetsWithVocab.map((s) => s.id)).toEqual([
      'regular',
    ]);
  });
});

describe('"only words in custom snippets"', () => {
  const words = [
    { id: 'w1', surfaceForm: 'parc', baseForm: 'parc' },
    { id: 'w2', surfaceForm: 'va', baseForm: 'aller' },
    { id: 'w3', surfaceForm: 'mange', baseForm: 'manger' },
  ] as WordTypes[];
  const suggestedOnly = {
    ...sentenceClip,
    id: 'suggested',
    focusedText: undefined,
    suggestedFocusText: 'on va',
  } as Snippet;

  it('keeps only words inside a human-set focusedText', () => {
    expect(
      filterWordsForCustomSnippetReview(
        words,
        [sentenceClip, suggestedOnly, { ...regularDue, focusedText: 'mange' }],
        true,
      ).map((w) => w.id),
    ).toEqual(['w1']);
  });

  it('does nothing when off', () => {
    expect(filterWordsForCustomSnippetReview(words, [], false)).toBe(words);
  });
});
