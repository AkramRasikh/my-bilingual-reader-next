import { assignVocabSpans } from './useSnippetReviewDataMemoized';
import {
  mockSnippetRepeatedSingular,
  mockSnippetRepeatedSingularJapanese,
  mockSnippetRepeatedSingularFrench,
} from './SnippetReview.mocks';

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

  it('covers the long repeated-好 mock without collapsing later copies', () => {
    const sentence = mockSnippetRepeatedSingular.targetLang;
    const assigned = assignVocabSpans(
      characters(sentence),
      mockSnippetRepeatedSingular.vocab,
    );

    expect(assigned.map((item) => item.text).join('')).toBe(sentence);
    expect(assigned.every((item) => item.meaning)).toBe(true);
    expect(
      assigned.filter((item) => item.surfaceForm === '好').map((item) => item.meaning),
    ).toEqual(['good', 'fine', 'well', 'alright', 'okay', 'nice']);
    const phraseSpans = assigned.filter(
      (item, index) =>
        item.surfaceForm === '不好' &&
        (index === 0 || item.startIndex !== assigned[index - 1].startIndex),
    );
    expect(phraseSpans.map((item) => item.meaning)).toEqual([
      'not good',
      'no good',
      "isn't good",
    ]);
  });

  it('covers the long repeated-の Japanese mock without collapsing later copies', () => {
    const sentence = mockSnippetRepeatedSingularJapanese.targetLang;
    const assigned = assignVocabSpans(
      characters(sentence),
      mockSnippetRepeatedSingularJapanese.vocab,
    );
    const firstOfSpan = assigned.filter(
      (item, index) =>
        index === 0 || item.startIndex !== assigned[index - 1].startIndex,
    );

    expect(assigned.map((item) => item.text).join('')).toBe(sentence);
    expect(assigned.every((item) => item.meaning)).toBe(true);
    expect(
      firstOfSpan
        .filter((item) => item.surfaceForm === 'の')
        .map((item) => item.meaning),
    ).toEqual(['one', "'s", 'one']);
    expect(
      firstOfSpan
        .filter((item) => item.surfaceForm === 'いい')
        .map((item) => item.meaning),
    ).toEqual(['good', 'fine', 'well', 'alright', 'okay', 'nice']);
  });

  it('covers the long repeated-bon French mock without collapsing later copies', () => {
    const sentence = mockSnippetRepeatedSingularFrench.targetLang;
    const assigned = assignVocabSpans(
      characters(sentence),
      mockSnippetRepeatedSingularFrench.vocab,
    );
    const firstOfSpan = assigned.filter(
      (item, index) =>
        index === 0 || item.startIndex !== assigned[index - 1].startIndex,
    );

    expect(assigned.map((item) => item.text).join('')).toBe(sentence);
    expect(assigned.every((item) => item.meaning)).toBe(true);
    expect(
      firstOfSpan
        .filter((item) => item.surfaceForm === 'bon')
        .map((item) => item.meaning),
    ).toEqual(['good', 'fine', 'well', 'alright', 'okay', 'nice']);
    expect(
      firstOfSpan
        .filter((item) => item.surfaceForm === 'pas bon')
        .map((item) => item.meaning),
    ).toEqual(['not good', 'no good', "isn't good"]);
  });
});
