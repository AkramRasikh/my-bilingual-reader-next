import { describe, it, expect, beforeEach } from '@jest/globals';
import { SentenceMapItemTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { mapSentenceIdsToSeconds } from '../utils/map-sentence-ids-to-seconds';
import {
  buildSentenceSnippetRecord,
  finalizeHoldRange,
  findSentenceSnippetForWord,
  focusedTextForResave,
  getClipText,
  isSentenceSnippet,
  isWordInCustomSnippetFocus,
  nudgeClipEdge,
  readSentenceSnippetDrafts,
  resolveClipFocus,
  sentenceSnippetDraftsKey,
  stepClipFocus,
  writeSentenceSnippetDrafts,
} from './sentence-snippet-utils';
import {
  moveFocusRangeLeft,
  moveFocusRangeRight,
} from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/snippet-focus-steps';

const MEDIA_DURATION = 12;

const sentence = (
  id: string,
  index: number,
  time: number,
  nextSentence: number | null,
  targetLang: string,
  baseLang: string,
  extra: Partial<SentenceMapItemTypes> = {},
) =>
  ({
    id,
    index,
    time,
    nextSentence,
    thisSentence: time,
    prevSentence: null,
    targetLang,
    baseLang,
    isDue: true,
    isUpForReview: true,
    targetLangformatted: [],
    helperReviewSentence: false,
    ...extra,
  }) as SentenceMapItemTypes;

export const buildFixture = () => {
  const sentences = [
    sentence('s1', 0, 0, 4, 'il fait beau', 'it is nice'),
    sentence('s2', 1, 4, 8, 'on va au parc', 'we go to the park'),
    sentence('s3', 2, 8, null, 'puis on mange', '', {
      meaning: 'then we eat',
    }),
  ];
  const sentenceMap = Object.fromEntries(sentences.map((s) => [s.id, s]));
  const secondsState = mapSentenceIdsToSeconds({
    content: sentences,
    duration: MEDIA_DURATION,
  });
  return { sentences, sentenceMap, secondsState };
};

describe('isSentenceSnippet', () => {
  it('is true only for origin sentence', () => {
    expect(isSentenceSnippet({ origin: 'sentence' })).toBe(true);
    expect(isSentenceSnippet({})).toBe(false);
    expect(isSentenceSnippet(undefined)).toBe(false);
  });
});

describe('finalizeHoldRange', () => {
  const { sentenceMap } = buildFixture();

  it('keeps the full end when the hold runs past the sentence end', () => {
    expect(
      finalizeHoldRange({
        pressTime: 5.1234,
        releaseTime: 9.5,
        sentence: sentenceMap.s2,
        mediaDuration: MEDIA_DURATION,
      }),
    ).toEqual({ start: 5.123, end: 9.5 });
  });

  it('clamps the start to the sentence and orders press/release', () => {
    expect(
      finalizeHoldRange({
        pressTime: 6,
        releaseTime: 3,
        sentence: sentenceMap.s2,
        mediaDuration: MEDIA_DURATION,
      }),
    ).toEqual({ start: 4, end: 6 });
  });

  it('caps the end at 60 s and at the media end', () => {
    expect(
      finalizeHoldRange({
        pressTime: 9,
        releaseTime: 30,
        sentence: sentenceMap.s3,
        mediaDuration: MEDIA_DURATION,
      }),
    ).toEqual({ start: 9, end: 12 });
    expect(
      finalizeHoldRange({
        pressTime: 10,
        releaseTime: 200,
        sentence: { time: 0, nextSentence: 100 },
        mediaDuration: 500,
      }),
    ).toEqual({ start: 10, end: 70 });
  });

  it('discards holds shorter than 0.25 s', () => {
    expect(
      finalizeHoldRange({
        pressTime: 5,
        releaseTime: 5.2,
        sentence: sentenceMap.s2,
        mediaDuration: MEDIA_DURATION,
      }),
    ).toBeNull();
  });
});

describe('nudgeClipEdge', () => {
  it('moves only the start', () => {
    expect(nudgeClipEdge({ start: 5, end: 7 }, 'start', -0.2, 12)).toEqual({
      start: 4.8,
      end: 7,
    });
  });

  it('moves only the end', () => {
    expect(nudgeClipEdge({ start: 5, end: 7 }, 'end', 0.2, 12)).toEqual({
      start: 5,
      end: 7.2,
    });
  });

  it('respects start >= 0, min length, max length and media end', () => {
    expect(nudgeClipEdge({ start: 0.1, end: 2 }, 'start', -0.2, 12).start).toBe(0);
    expect(nudgeClipEdge({ start: 5, end: 5.3 }, 'start', 0.2, 12)).toEqual({
      start: 5.05,
      end: 5.3,
    });
    expect(nudgeClipEdge({ start: 5, end: 5.3 }, 'end', -0.2, 12)).toEqual({
      start: 5,
      end: 5.25,
    });
    expect(nudgeClipEdge({ start: 10, end: 11.9 }, 'end', 0.2, 12).end).toBe(12);
    expect(nudgeClipEdge({ start: 10, end: 70 }, 'start', -0.2, 500).start).toBe(10);
  });
});

describe('getClipText', () => {
  const { sentenceMap, secondsState } = buildFixture();

  it('joins every sentence the clip overlaps in time', () => {
    const clipText = getClipText({
      range: { start: 5, end: 9.5 },
      secondsState,
      sentenceMap,
      mediaDuration: MEDIA_DURATION,
      isTrimmed: false,
    });
    expect(clipText?.sentenceIds).toEqual(['s2', 's3']);
    expect(clipText?.targetLang).toBe('on va au parc puis on mange');
    // s3 has no baseLang: falls back to its meaning.
    expect(clipText?.baseLang).toBe('we go to the park then we eat');
    expect(clipText?.sentenceBoundaries).toEqual(['on va au parc '.length]);
    expect(clipText?.targetLang).toContain(clipText?.suggestedFocusText);
  });

  it('includes the previous sentence when the start moved back', () => {
    const clipText = getClipText({
      range: { start: 3.5, end: 6 },
      secondsState,
      sentenceMap,
      mediaDuration: MEDIA_DURATION,
      isTrimmed: false,
    });
    expect(clipText?.sentenceIds).toEqual(['s1', 's2']);
  });

  it('works with fractional times and a range ending at the media end', () => {
    const clipText = getClipText({
      range: { start: 8.25, end: 12 },
      secondsState,
      sentenceMap,
      mediaDuration: MEDIA_DURATION,
      isTrimmed: false,
    });
    expect(clipText?.sentenceIds).toEqual(['s3']);
  });

  it("lets the focus cover the next sentence's words", () => {
    const clipText = getClipText({
      range: { start: 5, end: 9.5 },
      secondsState,
      sentenceMap,
      mediaDuration: MEDIA_DURATION,
      isTrimmed: false,
    })!;
    const text = clipText.targetLang;
    let range = { start: 0, end: 'on'.length };
    const seen: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      range = stepClipFocus(text, range, 'right', false) ?? range;
      seen.push(text.slice(range.start, range.end));
    }
    expect(seen).toEqual(['va', 'au', 'parc', 'puis', 'on', 'mange', 'mange']);
    const grown = stepClipFocus(text, { start: 0, end: 2 }, 'grow', false)!;
    expect(text.slice(grown.start, grown.end)).toBe('on va');
    const back = stepClipFocus(text, { start: 9, end: 18 }, 'left', false)!;
    expect(text.slice(back.start, back.end)).toBe('au parc');
  });
});

describe('resolveClipFocus', () => {
  const { sentenceMap, secondsState } = buildFixture();
  const clipText = getClipText({
    range: { start: 5, end: 9.5 },
    secondsState,
    sentenceMap,
    mediaDuration: MEDIA_DURATION,
    isTrimmed: false,
  })!;

  it('starts dashed on the suggestion', () => {
    const focus = resolveClipFocus({ clipText, isTrimmed: false });
    expect(focus.isHumanSet).toBe(false);
    expect(focus.range).toEqual(clipText.suggestedFocusRange);
  });

  it('is solid for a saved focusedText and for a session edit', () => {
    expect(
      resolveClipFocus({
        clipText,
        isTrimmed: false,
        savedFocusedText: 'parc',
      }),
    ).toEqual({ range: { start: 9, end: 13 }, isHumanSet: true });

    const edit = { start: 3, end: 5, text: 'va' };
    expect(
      resolveClipFocus({ clipText, isTrimmed: false, sessionEdit: edit }),
    ).toEqual({ range: { start: 3, end: 5 }, isHumanSet: true });
  });

  it('is dashed for a saved suggestion only, snapped to whole words', () => {
    expect(
      resolveClipFocus({
        clipText,
        isTrimmed: false,
        savedSuggestedFocusText: 'par',
      }),
    ).toEqual({ range: { start: 9, end: 13 }, isHumanSet: false });
  });

  it('moving back onto the suggestion still counts as human-set', () => {
    const suggestion = clipText.suggestedFocusRange!;
    const left = moveFocusRangeLeft(clipText.targetLang, suggestion, false);
    const back = moveFocusRangeRight(clipText.targetLang, left!, false)!;
    const focus = resolveClipFocus({
      clipText,
      isTrimmed: false,
      sessionEdit: {
        ...back,
        text: clipText.targetLang.slice(back.start, back.end),
      },
    });
    expect(focus.isHumanSet).toBe(true);
  });
});

describe('buildSentenceSnippetRecord', () => {
  const { sentenceMap, secondsState } = buildFixture();
  const clipText = getClipText({
    range: { start: 5, end: 9.5 },
    secondsState,
    sentenceMap,
    mediaDuration: MEDIA_DURATION,
    isTrimmed: false,
  })!;

  it('matches the extension shape, with suggestedFocusText only when unedited', () => {
    const record = buildSentenceSnippetRecord({
      id: 'clip-1',
      sentenceId: 's2',
      range: { start: 5, end: 9.5 },
      clipText,
    });
    expect(record).toEqual({
      id: 'clip-1',
      time: 7.25,
      start: 5,
      end: 9.5,
      sentenceId: 's2',
      origin: 'sentence',
      isContracted: false,
      isPreSnippet: false,
      targetLang: 'on va au parc puis on mange',
      baseLang: 'we go to the park then we eat',
      suggestedFocusText: clipText.suggestedFocusText,
    });
    expect(record).not.toHaveProperty('focusedText');
    expect(record).not.toHaveProperty('reviewData');
  });

  it('adds focusedText when a person set it', () => {
    const record = buildSentenceSnippetRecord({
      id: 'clip-1',
      sentenceId: 's2',
      range: { start: 5, end: 9.5 },
      clipText,
      focusedText: 'mange',
    });
    expect(record?.focusedText).toBe('mange');
  });

  it('refuses to save without a baseLang', () => {
    expect(
      buildSentenceSnippetRecord({
        id: 'clip-1',
        sentenceId: 's2',
        range: { start: 5, end: 9.5 },
        clipText: { ...clipText, baseLang: '  ' },
      }),
    ).toBeNull();
  });
});

describe('focusedTextForResave', () => {
  const { sentenceMap, secondsState } = buildFixture();
  const clipText = getClipText({
    range: { start: 5, end: 9.5 },
    secondsState,
    sentenceMap,
    mediaDuration: MEDIA_DURATION,
    isTrimmed: false,
  })!;

  it('keeps the existing focusedText when there is no new edit', () => {
    expect(
      focusedTextForResave({
        existingFocusedText: 'parc',
        clipText,
        displayedFocus: { range: { start: 9, end: 13 }, isHumanSet: true },
      }),
    ).toBe('parc');
  });

  it('uses a new edit over the existing focusedText', () => {
    expect(
      focusedTextForResave({
        sessionEdit: { start: 19, end: 21, text: 'on' },
        existingFocusedText: 'parc',
        clipText,
        displayedFocus: { range: { start: 19, end: 21 }, isHumanSet: true },
      }),
    ).toBe('on');
  });

  it('omits focusedText when only a suggestion exists', () => {
    expect(
      focusedTextForResave({
        clipText,
        displayedFocus: { range: { start: 9, end: 13 }, isHumanSet: false },
      }),
    ).toBeUndefined();
  });
});

describe('word helpers', () => {
  const snippets = [
    {
      id: 'regular',
      time: 2,
      targetLang: 'x',
      baseLang: 'y',
      focusedText: 'parc',
    },
    {
      id: 'suggested-only',
      origin: 'sentence',
      sentenceId: 's1',
      start: 1,
      end: 2,
      time: 1.5,
      targetLang: 'x',
      baseLang: 'y',
      suggestedFocusText: 'parc',
    },
    {
      id: 'other-sentence',
      origin: 'sentence',
      sentenceId: 's1',
      start: 1,
      end: 3,
      time: 2,
      targetLang: 'x',
      baseLang: 'y',
      focusedText: 'au parc',
    },
    {
      id: 'own-sentence',
      origin: 'sentence',
      sentenceId: 's2',
      start: 5,
      end: 6.5,
      time: 5.75,
      targetLang: 'x',
      baseLang: 'y',
      focusedText: 'le parc',
    },
  ] as Snippet[];

  it('keeps only words inside a sentence snippet focusedText', () => {
    expect(
      isWordInCustomSnippetFocus(
        { surfaceForm: 'parc', baseForm: 'parc' } as WordTypes,
        snippets,
      ),
    ).toBe(true);
    // Suggested-only focus and regular snippets don't count.
    expect(
      isWordInCustomSnippetFocus(
        { surfaceForm: 'parc', baseForm: 'parc' } as WordTypes,
        [snippets[0], snippets[1]],
      ),
    ).toBe(false);
    expect(
      isWordInCustomSnippetFocus(
        { surfaceForm: 'mange', baseForm: 'manger' } as WordTypes,
        snippets,
      ),
    ).toBe(false);
  });

  it("prefers the clip in the word's own sentence", () => {
    const word = {
      surfaceForm: 'parc',
      baseForm: 'parc',
      contexts: ['s2'],
    } as WordTypes;
    expect(findSentenceSnippetForWord(word, snippets)?.id).toBe('own-sentence');
    expect(
      findSentenceSnippetForWord({ ...word, contexts: ['s9'] }, snippets)?.id,
    ).toBe('other-sentence');
  });
});

describe('draft storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips drafts under ll-sentence-snippets:<contentId>', () => {
    const drafts = { s2: [{ id: 'd1', start: 5, end: 6, createdAt: 1 }] };
    writeSentenceSnippetDrafts('content-1', drafts);
    expect(
      JSON.parse(
        window.localStorage.getItem(sentenceSnippetDraftsKey('content-1'))!,
      ),
    ).toEqual(drafts);
    expect(readSentenceSnippetDrafts('content-1')).toEqual(drafts);
  });

  it('survives corrupt storage', () => {
    window.localStorage.setItem(sentenceSnippetDraftsKey('content-1'), '{nope');
    expect(readSentenceSnippetDrafts('content-1')).toEqual({});
  });

  it('removes the key when no drafts are left', () => {
    writeSentenceSnippetDrafts('content-1', { s2: [] });
    expect(
      window.localStorage.getItem(sentenceSnippetDraftsKey('content-1')),
    ).toBeNull();
  });
});
