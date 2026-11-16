import { findLooseClueSegments } from './clue-segments';

const police = {
  id: 's1',
  index: 1,
  sentenceStructure: 'x',
  targetLang: '警察射击有多不准',
  vocab: ['警察', '射击', '有', '多', '不准'].map((surfaceForm) => ({
    surfaceForm,
  })),
};

describe('findLooseClueSegments', () => {
  it('keeps matched pieces coloured and turns the leftovers into gaps', () => {
    expect(findLooseClueSegments('警察射击很不准', [police], police, true)).toEqual([
      { surfaceForm: '警察', index: 0 },
      { surfaceForm: '射击', index: 1 },
      { surfaceForm: '很', index: null },
      { surfaceForm: '不准', index: 4 },
    ]);
  });

  it('merges neighbouring unmatched characters into one gap', () => {
    expect(findLooseClueSegments('警察非常好', [police], police, true)).toEqual([
      { surfaceForm: '警察', index: 0 },
      { surfaceForm: '非常好', index: null },
    ]);
  });

  it('allows pieces out of sentence order', () => {
    expect(findLooseClueSegments('不准射击', [police], police, true)).toEqual([
      { surfaceForm: '不准', index: 4 },
      { surfaceForm: '射击', index: 1 },
    ]);
  });

  it('prefers the longest piece when pieces overlap', () => {
    const overlapping = {
      ...police,
      vocab: [{ surfaceForm: '不' }, { surfaceForm: '不准' }],
    };
    expect(findLooseClueSegments('很不准', [overlapping], overlapping, true)).toEqual([
      { surfaceForm: '很', index: null },
      { surfaceForm: '不准', index: 1 },
    ]);
  });

  it('needs at least one matched piece and at least two chips', () => {
    expect(findLooseClueSegments('你好吗', [police], police, true)).toBeNull();
    expect(findLooseClueSegments('警察', [police], police, true)).toBeNull();
  });

  it('falls back to the broken-down sentence that covers most of the word', () => {
    const weak = { ...police, id: 's2', index: 2, vocab: [{ surfaceForm: '警察' }] };
    const strong = { ...police, id: 's3', index: 9 };
    expect(
      findLooseClueSegments('警察射击很准', [weak, strong], null, true),
    ).toEqual([
      { surfaceForm: '警察', index: 0 },
      { surfaceForm: '射击', index: 1 },
      { surfaceForm: '很准', index: null },
    ]);
  });

  it('ignores sentences that were not broken down', () => {
    expect(
      findLooseClueSegments(
        '警察很好',
        [{ ...police, sentenceStructure: undefined }],
        null,
        true,
      ),
    ).toBeNull();
  });

  it('splits spaced languages on whole words, ignoring case and punctuation', () => {
    const french = {
      id: 'f1',
      sentenceStructure: 'x',
      targetLang: "J'ai posé un pied au Québec.",
      vocab: [
        { surfaceForm: "J'ai posé" },
        { surfaceForm: 'un pied' },
        { surfaceForm: 'au Québec' },
      ],
    };
    expect(
      findLooseClueSegments('poser un pied au Québec!', [french], french, false),
    ).toEqual([
      { surfaceForm: 'poser', index: null },
      { surfaceForm: 'un pied', index: 1 },
      { surfaceForm: 'au Québec!', index: 2 },
    ]);
  });

  describe('words that run into a neighbouring sentence', () => {
    const vocab = (pieces: string[]) =>
      pieces.map((surfaceForm) => ({ surfaceForm }));
    const before = {
      id: 'a',
      index: 4,
      sentenceStructure: 'x',
      targetLang: '其实',
      vocab: vocab(['其实']),
    };
    const main = {
      id: 'b',
      index: 5,
      sentenceStructure: 'x',
      targetLang: '我们成功躲过',
      vocab: vocab(['我们', '成功', '躲过']),
    };
    const after = {
      id: 'c',
      index: 6,
      sentenceStructure: 'x',
      targetLang: '关税战了',
      vocab: vocab(['关税', '战', '了']),
    };

    it('fills a trailing gap from the next sentence with its own colours', () => {
      expect(
        findLooseClueSegments('我们成功躲过关税战了', [before, main, after], main, true),
      ).toEqual([
        { surfaceForm: '我们', index: 0 },
        { surfaceForm: '成功', index: 1 },
        { surfaceForm: '躲过', index: 2 },
        { surfaceForm: '关税', index: 3 },
        { surfaceForm: '战', index: 4 },
        { surfaceForm: '了', index: 5 },
      ]);
    });

    it('fills a leading gap from the previous sentence', () => {
      expect(
        findLooseClueSegments('其实我们成功', [before, main, after], main, true),
      ).toEqual([
        { surfaceForm: '其实', index: 6 },
        { surfaceForm: '我们', index: 0 },
        { surfaceForm: '成功', index: 1 },
      ]);
    });

    it('leaves middle gaps grey and keeps what the neighbour cannot match', () => {
      expect(
        findLooseClueSegments('我们很成功躲过关税啊', [before, main, after], main, true),
      ).toEqual([
        { surfaceForm: '我们', index: 0 },
        { surfaceForm: '很', index: null },
        { surfaceForm: '成功', index: 1 },
        { surfaceForm: '躲过', index: 2 },
        { surfaceForm: '关税', index: 3 },
        { surfaceForm: '啊', index: null },
      ]);
    });

    it('ignores a neighbour that is not broken down', () => {
      expect(
        findLooseClueSegments(
          '我们成功躲过关税战了',
          [main, { ...after, sentenceStructure: undefined }],
          main,
          true,
        ),
      ).toEqual([
        { surfaceForm: '我们', index: 0 },
        { surfaceForm: '成功', index: 1 },
        { surfaceForm: '躲过', index: 2 },
        { surfaceForm: '关税战了', index: null },
      ]);
    });
  });
});
