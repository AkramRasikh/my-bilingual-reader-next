import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import { mapSentenceIdsToSeconds } from '../utils/map-sentence-ids-to-seconds';
import {
  RangeLoopState,
  useSentenceSnippets,
} from './useSentenceSnippets';
import {
  SENTENCE_SNIPPET_ALREADY_SAVED_MESSAGE,
  SENTENCE_SNIPPET_TOO_SHORT_MESSAGE,
  SENTENCE_SNIPPET_UPDATED_MESSAGE,
  readSentenceSnippetDrafts,
} from './sentence-snippet-utils';
import { sentenceSnippetGamepadBridge } from './sentence-snippet-gamepad-bridge';

const MEDIA_DURATION = 12;

const sentence = (
  id: string,
  index: number,
  time: number,
  nextSentence: number | null,
  targetLang: string,
  baseLang: string,
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
  }) as SentenceMapItemTypes;

const sentences = [
  sentence('s1', 0, 0, 4, 'il fait beau', 'it is nice'),
  sentence('s2', 1, 4, 8, 'on va au parc', 'we go to the park'),
  sentence('s3', 2, 8, null, 'puis on mange', 'then we eat'),
];
const sentenceMap = Object.fromEntries(sentences.map((s) => [s.id, s]));
const secondsState = mapSentenceIdsToSeconds({
  content: sentences,
  duration: MEDIA_DURATION,
});

type Media = {
  currentTime: number;
  paused: boolean;
  play: jest.Mock;
  pause: jest.Mock;
};

const setup = (initialSnippets: Snippet[] = []) => {
  const media: Media = {
    currentTime: 5,
    paused: false,
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(),
  };
  const saveCalls: Array<{ snippet: Snippet; isUpdate: boolean }> = [];
  const deleteCalls: string[] = [];
  const notify = jest.fn();
  // Mutate, then `hook.rerender()`, to change the review item.
  const review: { sentenceId: string | null; wordId: string | null } = {
    sentenceId: 's2',
    wordId: null,
  };

  const hook = renderHook(() => {
    const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
    const [rangeLoopState, setRangeLoopState] =
      useState<RangeLoopState | null>(null);
    const [threeSecondLoopState, setThreeSecondLoopState] = useState<
      number | null
    >(null);
    const [loopTranscriptState, setLoopTranscriptState] = useState<
      FormattedTranscriptTypes[]
    >([]);
    const api = useSentenceSnippets({
      ref: { current: media as unknown as HTMLVideoElement },
      contentId: 'content-1',
      contentOrigin: 'youtube',
      isInReviewMode: true,
      reviewSentenceId: review.sentenceId,
      reviewWordId: review.wordId,
      contentSnippets: snippets,
      sentenceMap,
      secondsState,
      mediaDuration: MEDIA_DURATION,
      isTrimmed: false,
      rangeLoopState,
      setRangeLoopState,
      threeSecondLoopState,
      setThreeSecondLoopState,
      loopTranscriptState,
      setLoopTranscriptState,
      saveSnippet: async (snippet, isUpdate) => {
        saveCalls.push({ snippet, isUpdate });
        setSnippets((prev) =>
          isUpdate
            ? prev.map((item) => (item.id === snippet.id ? snippet : item))
            : [...prev, snippet],
        );
        return true;
      },
      deleteSnippet: async (snippetId) => {
        deleteCalls.push(snippetId);
        setSnippets((prev) => prev.filter((item) => item.id !== snippetId));
      },
      notify,
    });
    return { api, rangeLoopState, snippets, setThreeSecondLoopState };
  });

  const holdClip = (press: number, release: number) => {
    media.currentTime = press;
    act(() => hook.result.current.api.holdStart());
    media.currentTime = release;
    act(() => hook.result.current.api.holdEnd());
  };

  return { hook, media, saveCalls, deleteCalls, notify, holdClip, review };
};

const savedClip: Snippet = {
  id: 'saved-1',
  time: 6,
  start: 5,
  end: 7,
  sentenceId: 's2',
  origin: 'sentence',
  isContracted: false,
  isPreSnippet: false,
  targetLang: 'on va au parc',
  baseLang: 'we go to the park',
  suggestedFocusText: 'au',
  focusedText: 'parc',
};

describe('useSentenceSnippets', () => {
  beforeEach(() => {
    window.localStorage.clear();
    sentenceSnippetGamepadBridge.reset();
  });

  it('a hold past the sentence end keeps its full end and loops the draft', () => {
    const { hook, holdClip } = setup();
    holdClip(5, 9.5);

    const { api, rangeLoopState } = hook.result.current;
    expect(rangeLoopState).toMatchObject({ start: 5, end: 9.5 });
    expect(api.focused?.clip).toMatchObject({
      kind: 'draft',
      sentenceId: 's2',
      start: 5,
      end: 9.5,
    });
    expect(readSentenceSnippetDrafts('content-1').s2).toEqual([
      expect.objectContaining({ start: 5, end: 9.5 }),
    ]);
    expect(api.focused?.clipText?.targetLang).toBe(
      'on va au parc puis on mange',
    );
    expect(sentenceSnippetGamepadBridge.isClipLoopActive()).toBe(true);
  });

  it('discards a too-short hold with a message', () => {
    const { hook, holdClip, notify } = setup();
    holdClip(5, 5.1);
    expect(notify).toHaveBeenCalledWith(SENTENCE_SNIPPET_TOO_SHORT_MESSAGE);
    expect(hook.result.current.api.focused).toBeNull();
  });

  it('draft focus starts dashed; Y makes it solid and moves it; L1+A grows it', () => {
    const { hook, holdClip } = setup();
    holdClip(5, 9.5);
    const start = hook.result.current.api.focused!;
    expect(start.focus.isHumanSet).toBe(false);
    expect(start.saveHint).toBe('L1+X save');

    act(() => hook.result.current.api.moveFocus('left'));
    const moved = hook.result.current.api.focused!;
    expect(moved.focus.isHumanSet).toBe(true);
    expect(moved.focus.range!.start).toBeLessThan(start.focus.range!.start);

    act(() => hook.result.current.api.moveFocus('grow'));
    const grown = hook.result.current.api.focused!;
    expect(grown.focus.range!.end).toBeGreaterThan(moved.focus.range!.end);
    expect(grown.focus.range!.start).toBe(moved.focus.range!.start);
  });

  it('L1+X on an unedited draft saves suggestedFocusText only and drops the draft', async () => {
    const { hook, holdClip, saveCalls } = setup();
    holdClip(5, 9.5);
    const draftId = hook.result.current.api.focused!.clip.id;

    await act(() => hook.result.current.api.save());

    expect(saveCalls).toHaveLength(1);
    expect(saveCalls[0].isUpdate).toBe(false);
    expect(saveCalls[0].snippet).toMatchObject({
      id: draftId,
      origin: 'sentence',
      sentenceId: 's2',
      start: 5,
      end: 9.5,
      time: 7.25,
      targetLang: 'on va au parc puis on mange',
    });
    expect(saveCalls[0].snippet.suggestedFocusText).toBeTruthy();
    expect(saveCalls[0].snippet).not.toHaveProperty('focusedText');
    expect(saveCalls[0].snippet).not.toHaveProperty('reviewData');
    expect(readSentenceSnippetDrafts('content-1')).toEqual({});
    // Still looping, now as the saved clip.
    expect(hook.result.current.api.focused?.clip).toMatchObject({
      id: draftId,
      kind: 'saved',
    });
    expect(hook.result.current.api.focused?.saveHint).toBe('✓ saved');
  });

  it('L1+X on an edited draft also saves focusedText', async () => {
    const { hook, holdClip, saveCalls } = setup();
    holdClip(5, 9.5);
    act(() => hook.result.current.api.moveFocus('right'));
    const { focus, clipText } = hook.result.current.api.focused!;
    const shown = clipText!.targetLang.slice(focus.range!.start, focus.range!.end);

    await act(() => hook.result.current.api.save());

    expect(saveCalls[0].snippet.focusedText).toBe(shown);
    expect(saveCalls[0].snippet.suggestedFocusText).toBeTruthy();
    expect(saveCalls[0].snippet.targetLang).toContain(shown);
  });

  it('nudges move one edge, re-loop from the start and keep sentenceId', () => {
    const { hook, holdClip, media } = setup();
    holdClip(4.1, 6);
    act(() => hook.result.current.api.nudge('start', -1));
    expect(hook.result.current.rangeLoopState).toMatchObject({
      start: 3.9,
      end: 6,
    });
    expect(media.currentTime).toBe(3.9);
    const clip = hook.result.current.api.focused!.clip;
    // Moved into the previous sentence: still belongs to s2, text picks up s1.
    expect(clip.sentenceId).toBe('s2');
    expect(hook.result.current.api.focused!.clipText!.sentenceIds).toEqual([
      's1',
      's2',
    ]);
    expect(readSentenceSnippetDrafts('content-1').s2[0]).toMatchObject({
      start: 3.9,
      end: 6,
    });

    act(() => hook.result.current.api.nudge('end', 1));
    expect(hook.result.current.rangeLoopState).toMatchObject({
      start: 3.9,
      end: 6.2,
    });
  });

  it('a nudged saved clip re-saves with the same id and keeps focusedText', async () => {
    const { hook, saveCalls, notify } = setup([savedClip]);
    act(() => hook.result.current.api.selectLast());
    expect(hook.result.current.api.focused?.focus).toMatchObject({
      isHumanSet: true,
    });

    act(() => hook.result.current.api.nudge('end', 1));
    expect(hook.result.current.api.focused?.saveHint).toBe('L1+X save times');

    await act(() => hook.result.current.api.save());

    expect(saveCalls).toHaveLength(1);
    expect(saveCalls[0].isUpdate).toBe(true);
    expect(saveCalls[0].snippet).toMatchObject({
      id: 'saved-1',
      sentenceId: 's2',
      start: 5,
      end: 7.2,
      time: 6.1,
      focusedText: 'parc',
    });
    expect(notify).toHaveBeenCalledWith(SENTENCE_SNIPPET_UPDATED_MESSAGE);
  });

  it('L1+X on an unchanged saved clip only says it is saved', async () => {
    const { hook, saveCalls, notify } = setup([savedClip]);
    act(() => hook.result.current.api.selectLast());
    await act(() => hook.result.current.api.save());
    expect(saveCalls).toHaveLength(0);
    expect(notify).toHaveBeenCalledWith(SENTENCE_SNIPPET_ALREADY_SAVED_MESSAGE);
  });

  it('L2+R2 deletes a draft at once and a saved clip on the second press', async () => {
    const { hook, holdClip, deleteCalls } = setup([savedClip]);
    holdClip(5, 6);
    expect(hook.result.current.api.focused?.deleteHint).toBe('L2+R2 delete');
    await act(() => hook.result.current.api.deleteFocused());
    expect(readSentenceSnippetDrafts('content-1')).toEqual({});
    expect(hook.result.current.api.focused).toBeNull();
    expect(deleteCalls).toEqual([]);

    act(() => hook.result.current.api.selectLast());
    expect(hook.result.current.api.focused?.deleteHint).toBe(
      'L2+R2 ×2 delete',
    );
    await act(() => hook.result.current.api.deleteFocused());
    expect(deleteCalls).toEqual([]);
    expect(hook.result.current.api.focused?.deleteHint).toBe(
      'L2+R2 again to delete',
    );
    await act(() => hook.result.current.api.deleteFocused());
    expect(deleteCalls).toEqual(['saved-1']);
    expect(hook.result.current.api.focused).toBeNull();
  });

  it('the gamepad bridge routes L2+R2 to the focused clip', async () => {
    const { hook, holdClip } = setup();
    expect(sentenceSnippetGamepadBridge.deleteFocusedClip()).toBe(false);
    holdClip(5, 6);
    await act(async () => {
      expect(sentenceSnippetGamepadBridge.deleteFocusedClip()).toBe(true);
    });
    expect(hook.result.current.api.focused).toBeNull();
  });

  it('B ends the loop without seeking and plays if paused', () => {
    const { hook, holdClip, media } = setup();
    holdClip(5, 6);
    media.currentTime = 5.6;
    media.paused = true;
    media.play.mockClear();

    act(() => hook.result.current.api.endLoop());

    expect(hook.result.current.rangeLoopState).toBeNull();
    expect(media.currentTime).toBe(5.6);
    expect(media.play).toHaveBeenCalledTimes(1);
    expect(sentenceSnippetGamepadBridge.isClipLoopActive()).toBe(false);
  });

  it('D-pad steps between clips by start time', () => {
    const later = { ...savedClip, id: 'saved-2', start: 6, end: 7.5, time: 6.75 };
    const { hook } = setup([savedClip, later]);
    act(() => hook.result.current.api.selectLast());
    expect(hook.result.current.api.focused?.clip.id).toBe('saved-2');
    act(() => hook.result.current.api.step(-1));
    expect(hook.result.current.api.focused?.clip.id).toBe('saved-1');
    act(() => hook.result.current.api.step(-1));
    expect(hook.result.current.api.focused?.clip.id).toBe('saved-1');
  });

  it('B on a review word loops its snippet without focusing the clip', () => {
    const { hook, media, review } = setup([savedClip]);
    review.sentenceId = null;
    review.wordId = 'word-1';
    hook.rerender();

    act(() =>
      hook.result.current.api.loopWordSnippet('word-1', {
        start: 5,
        end: 7,
        snippetId: 'saved-1',
      }),
    );

    expect(hook.result.current.rangeLoopState).toEqual({
      start: 5,
      end: 7,
      clipId: 'saved-1',
      wordId: 'word-1',
    });
    expect(media.currentTime).toBe(5);
    expect(hook.result.current.api.focused).toBeNull();
    // B and L2+R2 stay with the word card.
    expect(sentenceSnippetGamepadBridge.shouldIgnoreB()).toBe(false);
    expect(sentenceSnippetGamepadBridge.deleteFocusedClip()).toBe(false);

    // Moving on to the next review item ends the loop.
    review.wordId = 'word-2';
    hook.rerender();
    expect(hook.result.current.rangeLoopState).toBeNull();
  });

  it('starting the 3 s loop clears the clip loop', () => {
    const { hook, holdClip } = setup();
    holdClip(5, 6);
    act(() => hook.result.current.setThreeSecondLoopState(5));
    expect(hook.result.current.rangeLoopState).toBeNull();
  });
});
