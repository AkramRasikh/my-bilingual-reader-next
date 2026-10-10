import { describe, expect, it } from '@jest/globals';
import {
  findBreakdownPiecesForPhrase,
  findSavedWordBreakdown,
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
});
