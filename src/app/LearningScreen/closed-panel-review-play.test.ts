import {
  closedPanelGradeTarget,
  getWordReplayTarget,
  playFirstReviewItem,
} from './closed-panel-review-play';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';

const word = {
  id: 'word-1',
  surfaceForm: '天気',
  baseForm: '天気',
  contexts: ['sentence-2'],
} as WordTypes;

const snippet = {
  id: 'snippet-1',
  time: 8,
  isContracted: true,
} as Snippet;

function handlers() {
  return {
    handlePause: jest.fn(),
    handleFromHere: jest.fn(),
    handlePlayFromHere: jest.fn(),
    playFromThisContext: jest.fn(),
    handleLoopReviewMode: jest.fn(),
  };
}

const due = new Date('2020-01-01').toISOString();
const later = new Date('2999-01-01').toISOString();
const now = new Date('2026-01-01');

describe('closedPanelGradeTarget', () => {
  it('grades the first snippet ahead of a due word', () => {
    const target = closedPanelGradeTarget({
      snippets: [snippet],
      words: [{ ...word, reviewData: { due } } as WordTypes],
      sentences: [],
      now,
    });

    expect(target?.kind).toBe('snippet');
    expect(target?.item.id).toBe('snippet-1');
  });

  it('grades a due word when no snippet is waiting', () => {
    const target = closedPanelGradeTarget({
      snippets: [],
      words: [{ ...word, reviewData: { due } } as WordTypes],
      sentences: [
        {
          id: 'sentence-1',
          time: 2,
          reviewData: { due },
        } as FormattedTranscriptTypes,
      ],
      now,
    });

    expect(target?.kind).toBe('word');
    expect(target?.item.id).toBe('word-1');
  });

  it('does not grade a later sentence when the first word is not due', () => {
    const target = closedPanelGradeTarget({
      snippets: [],
      words: [{ ...word, reviewData: { due: later } } as WordTypes],
      sentences: [
        {
          id: 'sentence-1',
          time: 2,
          reviewData: { due },
        } as FormattedTranscriptTypes,
      ],
      now,
    });

    expect(target).toBeNull();
  });

  it('grades a due sentence when the other queues are empty', () => {
    const target = closedPanelGradeTarget({
      snippets: [],
      words: [],
      sentences: [
        {
          id: 'sentence-1',
          time: 2,
          reviewData: { due },
        } as FormattedTranscriptTypes,
      ],
      now,
    });

    expect(target?.kind).toBe('sentence');
    expect(target?.item.id).toBe('sentence-1');
  });
});

describe('playFirstReviewItem', () => {
  it('starts the first snippet ahead of a word or sentence', () => {
    const actions = handlers();

    playFirstReviewItem({
      ...actions,
      snippets: [snippet],
      words: [word],
      sentences: [{ id: 'sentence-1', time: 2 }],
      contentSnippets: [],
      isVideoPlaying: false,
      masterPlay: null,
    });

    expect(actions.handleLoopReviewMode).toHaveBeenCalledWith({
      time: 8,
      isContracted: true,
      snippetId: 'snippet-1',
    });
    expect(actions.playFromThisContext).not.toHaveBeenCalled();
    expect(actions.handleFromHere).not.toHaveBeenCalled();
  });

  it('plays a word from an overlapping snippet, or pauses when that context is already playing', () => {
    const overlap = {
      id: 'overlap',
      time: 6,
      focusedText: '天気',
      isPreSnippet: false,
    } as Snippet;
    const playing = handlers();

    playFirstReviewItem({
      ...playing,
      snippets: [],
      words: [word],
      sentences: [{ id: 'sentence-1', time: 2 }],
      contentSnippets: [overlap],
      isVideoPlaying: true,
      masterPlay: 'sentence-2',
    });

    expect(playing.handlePause).toHaveBeenCalled();
    expect(playing.handlePlayFromHere).not.toHaveBeenCalled();

    const seeking = handlers();
    playFirstReviewItem({
      ...seeking,
      snippets: [],
      words: [word],
      sentences: [],
      contentSnippets: [overlap],
      isVideoPlaying: false,
      masterPlay: null,
    });

    expect(seeking.handlePlayFromHere).toHaveBeenCalledWith(4.5);
  });

  it('plays a word context when no snippet overlaps it', () => {
    const actions = handlers();

    playFirstReviewItem({
      ...actions,
      snippets: [],
      words: [word],
      sentences: [],
      contentSnippets: [],
      isVideoPlaying: false,
      masterPlay: null,
    });

    expect(actions.playFromThisContext).toHaveBeenCalledWith('sentence-2');
  });

  it('plays the first sentence, or pauses when that sentence is already playing', () => {
    const seeking = handlers();

    playFirstReviewItem({
      ...seeking,
      snippets: [],
      words: [],
      sentences: [{ id: 'sentence-1', time: 2 }],
      contentSnippets: [],
      isVideoPlaying: false,
      masterPlay: null,
    });

    expect(seeking.handleFromHere).toHaveBeenCalledWith(2);

    const playing = handlers();
    playFirstReviewItem({
      ...playing,
      snippets: [],
      words: [],
      sentences: [{ id: 'sentence-1', time: 2 }],
      contentSnippets: [],
      isVideoPlaying: true,
      masterPlay: 'sentence-1',
    });

    expect(playing.handlePause).toHaveBeenCalled();
    expect(playing.handleFromHere).not.toHaveBeenCalled();
  });
});

describe('word replay with custom sentence snippets', () => {
  const regular = {
    id: 'regular',
    time: 20,
    focusedText: '天気',
    isPreSnippet: false,
  } as Snippet;
  const clipElsewhere = {
    id: 'clip-elsewhere',
    origin: 'sentence',
    sentenceId: 'sentence-9',
    start: 30,
    end: 31.5,
    time: 30.75,
    focusedText: '今日の天気',
  } as Snippet;
  const clipOwnSentence = {
    ...clipElsewhere,
    id: 'clip-own',
    sentenceId: 'sentence-2',
    start: 10,
    end: 12.5,
  } as Snippet;
  const suggestedOnlyClip = {
    ...clipOwnSentence,
    id: 'clip-suggested',
    focusedText: undefined,
    suggestedFocusText: '天気',
  } as Snippet;

  it("prefers the clip in the word's own sentence and loops it start..end", () => {
    expect(
      getWordReplayTarget(word, [regular], [clipElsewhere, clipOwnSentence]),
    ).toEqual({ kind: 'range', start: 10, end: 12.5, snippetId: 'clip-own' });

    const h = handlers();
    const loopWordSnippet = jest.fn();
    playFirstReviewItem({
      ...h,
      snippets: [],
      words: [word],
      sentences: [],
      contentSnippets: [regular],
      sentenceSnippets: [clipElsewhere, clipOwnSentence],
      loopWordSnippet,
      isVideoPlaying: false,
      masterPlay: null,
    });
    expect(loopWordSnippet).toHaveBeenCalledWith(
      word.id,
      expect.objectContaining({ start: 10, end: 12.5, snippetId: 'clip-own' }),
    );
    expect(h.handlePlayFromHere).not.toHaveBeenCalled();
  });

  it('falls back to the regular snippet match, ignoring suggested-only clips', () => {
    expect(getWordReplayTarget(word, [regular], [suggestedOnlyClip])).toEqual({
      kind: 'from',
      time: 18.5,
    });
  });

  it('never uses a sentence snippet through the regular snippet match', () => {
    expect(getWordReplayTarget(word, [suggestedOnlyClip], [])).toBeNull();
  });
});

