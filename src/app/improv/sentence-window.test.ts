import { describe, expect, it } from '@jest/globals';
import { findSentenceWindow } from './sentence-window';

const contentState = [
  {
    content: [
      { id: 's1', targetLang: 'Previous line' },
      { id: 's2', targetLang: '  Current line  ' },
      { id: 's3', targetLang: 'Next line' },
    ],
  },
  {
    content: [{ id: 'only', targetLang: 'Only line' }],
  },
];

describe('findSentenceWindow', () => {
  it('returns the sentence plus its neighbors in the same transcript', () => {
    expect(findSentenceWindow('s2', contentState)).toEqual({
      previous: 'Previous line',
      current: 'Current line',
      next: 'Next line',
    });
  });

  it('omits a missing neighbor at the ends of a transcript', () => {
    expect(findSentenceWindow('s1', contentState)).toEqual({
      previous: null,
      current: 'Previous line',
      next: 'Current line',
    });
    expect(findSentenceWindow('only', contentState)).toEqual({
      previous: null,
      current: 'Only line',
      next: null,
    });
  });

  it('uses a generated sentence without neighbors', () => {
    expect(
      findSentenceWindow('generated', contentState, [
        { id: 'generated', targetLang: 'Made up sentence' },
      ]),
    ).toEqual({
      previous: null,
      current: 'Made up sentence',
      next: null,
    });
  });

  it('returns an empty window when the word has no sentence', () => {
    expect(findSentenceWindow(undefined, contentState)).toEqual({
      previous: null,
      current: null,
      next: null,
    });
    expect(findSentenceWindow('missing', contentState)).toEqual({
      previous: null,
      current: null,
      next: null,
    });
  });
});
