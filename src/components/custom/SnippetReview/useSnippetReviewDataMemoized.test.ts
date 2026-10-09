import { assignVocabSpans } from './useSnippetReviewDataMemoized';

const characters = (text: string) =>
  text.split('').map((char, index) => ({ text: char, index }));

describe('assignVocabSpans', () => {
  it('keeps repeated characters as separate breakdown pieces', () => {
    const assigned = assignVocabSpans(characters('好不好，好。'), [
      { surfaceForm: '好', meaning: 'good' },
      { surfaceForm: '不', meaning: 'not' },
      { surfaceForm: '好', meaning: 'good' },
      { surfaceForm: '，', meaning: 'comma' },
      { surfaceForm: '好', meaning: 'good' },
      { surfaceForm: '。', meaning: 'period' },
    ]);

    expect(assigned.map((item) => item.meaning)).toEqual([
      'good',
      'not',
      'good',
      'comma',
      'good',
      'period',
    ]);
    expect(assigned.map((item) => item.startIndex)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('lets a longer phrase claim its span before a repeated character', () => {
    const assigned = assignVocabSpans(characters('好不好'), [
      { surfaceForm: '好', meaning: 'good' },
      { surfaceForm: '不好', meaning: 'not good' },
    ]);

    expect(assigned.map((item) => item.meaning)).toEqual([
      'good',
      'not good',
      'not good',
    ]);
    expect(assigned.map((item) => item.startIndex)).toEqual([0, 1, 1]);
  });
});
