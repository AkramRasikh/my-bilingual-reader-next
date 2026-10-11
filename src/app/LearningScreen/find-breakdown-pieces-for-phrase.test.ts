import { describe, expect, it } from '@jest/globals';
import {
  findBreakdownPiecesForPhrase,
  findSavedWordBreakdown,
  findWordContextSentence,
  splitSentenceAroundPhrase,
} from './find-breakdown-pieces-for-phrase';

const sentence = [
  { surfaceForm: '我' },
  { surfaceForm: '什么' },
  { surfaceForm: '忙' },
  { surfaceForm: '都' },
  { surfaceForm: '没有' },
  { surfaceForm: '帮' },
  { surfaceForm: '到' },
];

describe('findBreakdownPiecesForPhrase', () => {
  it('returns the consecutive pieces that make up a saved phrase', () => {
    expect(findBreakdownPiecesForPhrase('没有帮到', sentence)).toEqual([
      { surfaceForm: '没有', index: 4 },
      { surfaceForm: '帮', index: 5 },
      { surfaceForm: '到', index: 6 },
    ]);
  });

  it('returns every piece when the saved word is the whole sentence', () => {
    expect(findBreakdownPiecesForPhrase('我什么忙都没有帮到', sentence)).toHaveLength(
      7,
    );
  });

  it('returns null when the saved word is already a single piece', () => {
    expect(findBreakdownPiecesForPhrase('没有', sentence)).toBeNull();
  });

  it('matches when the saved phrase uses 的 and the breakdown uses 得', () => {
    expect(
      findBreakdownPiecesForPhrase('还是硬的起来', [
        { surfaceForm: '我' },
        { surfaceForm: '每天' },
        { surfaceForm: '都' },
        { surfaceForm: '还是' },
        { surfaceForm: '硬' },
        { surfaceForm: '得' },
        { surfaceForm: '起来' },
      ]),
    ).toEqual([
      { surfaceForm: '还是', index: 3 },
      { surfaceForm: '硬', index: 4 },
      { surfaceForm: '得', index: 5 },
      { surfaceForm: '起来', index: 6 },
    ]);
  });

  it('returns null when the phrase does not line up with the breakdown', () => {
    expect(findBreakdownPiecesForPhrase('有帮', sentence)).toBeNull();
  });

  it('uses a nearby broken-down sentence when the saved context is a different sentence', () => {
    const linkedSentence = {
      id: 'linked',
      index: 354,
      sentenceStructure: '捷运 + 上',
      targetLang: '捷运上本来就有很多状况嘛',
      vocab: [{ surfaceForm: '捷运' }, { surfaceForm: '上' }],
    };
    const stevenSentence = {
      id: 'steven',
      index: 355,
      sentenceStructure: '我 + 知道 + 好 + 但',
      targetLang: '-我知道-好但怎么样都不会有Steven',
      vocab: [
        { surfaceForm: '我' },
        { surfaceForm: '知道' },
        { surfaceForm: '好' },
        { surfaceForm: '但' },
        { surfaceForm: '怎么样' },
        { surfaceForm: '都' },
        { surfaceForm: '不会' },
        { surfaceForm: '有' },
        { surfaceForm: 'Steven' },
      ],
    };

    expect(
      findSavedWordBreakdown(
        '但怎么样都不会有Steven',
        [linkedSentence, stevenSentence],
        linkedSentence,
      ),
    ).toEqual([
      { surfaceForm: '但', index: 3 },
      { surfaceForm: '怎么样', index: 4 },
      { surfaceForm: '都', index: 5 },
      { surfaceForm: '不会', index: 6 },
      { surfaceForm: '有', index: 7 },
      { surfaceForm: 'Steven', index: 8 },
    ]);
  });

  it('keeps the linked sentence when that breakdown already contains the phrase', () => {
    const linkedSentence = {
      id: 'linked',
      index: 1,
      sentenceStructure: '没有 + 帮 + 到',
      targetLang: '我什么忙都没有帮到',
      vocab: sentence,
    };

    expect(
      findSavedWordBreakdown('没有帮到', [linkedSentence], linkedSentence),
    ).toEqual([
      { surfaceForm: '没有', index: 4 },
      { surfaceForm: '帮', index: 5 },
      { surfaceForm: '到', index: 6 },
    ]);
  });

  it('joins spaced languages with spaces', () => {
    expect(
      findBreakdownPiecesForPhrase('let me speak', [
        { surfaceForm: 'let' },
        { surfaceForm: 'me' },
        { surfaceForm: 'speak' },
      ]),
    ).toEqual([
      { surfaceForm: 'let', index: 0 },
      { surfaceForm: 'me', index: 1 },
      { surfaceForm: 'speak', index: 2 },
    ]);
  });

  it('uses the linked sentence when it contains the saved word', () => {
    const linkedSentence = {
      id: 'linked',
      index: 4,
      targetLang: '我去彩券行买了一张',
    };

    expect(
      findWordContextSentence('彩券行', [linkedSentence], linkedSentence),
    ).toBe('我去彩券行买了一张');
  });

  it('uses a nearby sentence when the linked one does not contain the word', () => {
    const linkedSentence = {
      id: 'linked',
      index: 4,
      targetLang: '捷运上本来就有很多状况嘛',
    };
    const stevenSentence = {
      id: 'steven',
      index: 5,
      targetLang: '-我知道-好但怎么样都不会有Steven',
    };

    expect(
      findWordContextSentence(
        '但怎么样都不会有Steven',
        [linkedSentence, stevenSentence],
        linkedSentence,
      ),
    ).toBe('-我知道-好但怎么样都不会有Steven');
  });

  it('uses a nearby sentence when the saved context is the previous line', () => {
    const linkedSentence = {
      id: 'c13e5c14-5604-4dc3-9ec3-c38b3d081589',
      index: 200,
      targetLang: '我要啦',
    };

    expect(
      findWordContextSentence(
        '彩券行',
        [
          linkedSentence,
          {
            id: 'a9eda746-df1e-4993-bf38-72263f41acc6',
            index: 201,
            targetLang: '嗯彩券行不还给我啊',
          },
        ],
        linkedSentence,
      ),
    ).toBe('嗯彩券行不还给我啊');
  });
  it('skips a sentence that is only the saved word', () => {
    expect(
      findWordContextSentence(
        '彩券行',
        [{ id: 'only', index: 1, targetLang: '彩券行' }],
        { id: 'only', index: 1, targetLang: '彩券行' },
      ),
    ).toBeNull();
  });

  it('marks the saved word inside its sentence', () => {
    expect(splitSentenceAroundPhrase('嗯彩券行不还给我啊', '彩券行')).toEqual([
      { text: '嗯', highlighted: false },
      { text: '彩券行', highlighted: true },
      { text: '不还给我啊', highlighted: false },
    ]);
  });

  it('marks the saved word when the sentence has spaces or dashes', () => {
    expect(
      splitSentenceAroundPhrase(
        '-我知道-好但怎么样都不会有Steven',
        '但怎么样都不会有Steven',
      ),
    ).toEqual([
      { text: '-我知道-好', highlighted: false },
      { text: '但怎么样都不会有Steven', highlighted: true },
    ]);
  });

  it('marks the sentence spelling when the saved word uses 得', () => {
    expect(
      splitSentenceAroundPhrase('我每天都还是硬的起来', '还是硬得起来'),
    ).toEqual([
      { text: '我每天都', highlighted: false },
      { text: '还是硬的起来', highlighted: true },
    ]);
  });
});
