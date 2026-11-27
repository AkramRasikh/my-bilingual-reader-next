import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { isDueCheck } from '@/utils/is-due-check';
import {
  findSentenceSnippetForWord,
  isSentenceSnippet,
} from './sentence-snippets/sentence-snippet-utils';

type ReviewPlayHandlers = {
  handlePause: () => void;
  handleFromHere: (time: number) => void;
  handlePlayFromHere: (time: number) => void;
  playFromThisContext: (contextId: FormattedTranscriptTypes['id']) => void;
  handleLoopReviewMode: (params: {
    time: number;
    isContracted?: boolean;
    snippetId?: string;
  }) => void;
};

type PlayFirstReviewItemArgs = ReviewPlayHandlers & {
  snippets: Snippet[];
  words: WordTypes[];
  sentences: Array<Pick<FormattedTranscriptTypes, 'id' | 'time'>>;
  contentSnippets: Snippet[];
  isVideoPlaying: boolean;
  masterPlay: FormattedTranscriptTypes['id'] | null;
  /** Custom sentence snippets of this content (origin: 'sentence'). */
  sentenceSnippets?: Snippet[];
  /** Loops a word's custom snippet (B on a word inside one). */
  loopWordSnippet?: (
    wordId: string,
    clip: { start: number; end: number; snippetId: string },
  ) => void;
};

export function wordOverlapPlayTime(
  word: WordTypes,
  contentSnippets: Snippet[],
) {
  const matchesWord = (item: Snippet) =>
    item?.focusedText?.includes(word.surfaceForm) ||
    item?.focusedText?.includes(word.baseForm) ||
    item?.suggestedFocusText?.includes(word.surfaceForm) ||
    item?.suggestedFocusText?.includes(word.baseForm);

  const regularSnippets = contentSnippets.filter(
    (item) => !isSentenceSnippet(item),
  );
  const overlappedWord =
    regularSnippets.find((item) => matchesWord(item) && !item?.isPreSnippet) ??
    regularSnippets.find(matchesWord);

  if (!overlappedWord) {
    return null;
  }

  const contracted = Boolean(
    (overlappedWord as Snippet & { isContract?: boolean }).isContract,
  );
  return contracted ? overlappedWord.time - 0.75 : overlappedWord.time - 1.5;
}

export type WordReplayTarget =
  | { kind: 'range'; start: number; end: number; snippetId: string }
  | { kind: 'from'; time: number }
  | null;

/**
 * What B / replay on a word card plays, in order: a sentence snippet whose
 * focusedText contains the word (preferring the word's own sentence), played
 * start..end once; else the existing snippet match; else nothing (the caller
 * falls back to the sentence).
 */
export function getWordReplayTarget(
  word: WordTypes,
  contentSnippets: Snippet[],
  sentenceSnippets: Snippet[] = [],
): WordReplayTarget {
  const clip = findSentenceSnippetForWord(word, sentenceSnippets);
  if (clip) {
    return { kind: 'range', start: clip.start, end: clip.end, snippetId: clip.id };
  }
  const time = wordOverlapPlayTime(word, contentSnippets);
  return time != null ? { kind: 'from', time } : null;
}

export type ClosedPanelGradeTarget =
  | { kind: 'snippet'; item: Snippet }
  | { kind: 'word'; item: WordTypes }
  | { kind: 'sentence'; item: FormattedTranscriptTypes };

export function closedPanelGradeTarget({
  snippets,
  words,
  sentences,
  now,
}: {
  snippets: Snippet[];
  words: WordTypes[];
  sentences: FormattedTranscriptTypes[];
  now: Date;
}): ClosedPanelGradeTarget | null {
  const snippet = snippets[0];
  if (snippet) {
    return { kind: 'snippet', item: snippet };
  }

  const word = words[0];
  if (word) {
    const isDue = !word.reviewData || isDueCheck(word, now);
    return isDue ? { kind: 'word', item: word } : null;
  }

  const sentence = sentences[0];
  const dueAt = sentence?.reviewData?.due;
  if (sentence && dueAt && new Date(dueAt) < now) {
    return { kind: 'sentence', item: sentence };
  }

  return null;
}

export function playFirstReviewItem({
  snippets,
  words,
  sentences,
  contentSnippets,
  isVideoPlaying,
  masterPlay,
  handlePause,
  handleFromHere,
  handlePlayFromHere,
  playFromThisContext,
  handleLoopReviewMode,
  sentenceSnippets = [],
  loopWordSnippet,
}: PlayFirstReviewItemArgs) {
  const snippet = snippets[0];
  if (snippet) {
    handleLoopReviewMode({
      time: snippet.time,
      isContracted: snippet.isContracted,
      snippetId: snippet.id,
    });
    return;
  }

  const word = words[0];
  if (word) {
    const contextId = word.contexts?.[0];
    if (isVideoPlaying && contextId != null && contextId === masterPlay) {
      handlePause();
      return;
    }

    const replay = getWordReplayTarget(word, contentSnippets, sentenceSnippets);
    if (replay?.kind === 'range' && loopWordSnippet) {
      loopWordSnippet(word.id, replay);
      return;
    }
    if (replay?.kind === 'from') {
      handlePlayFromHere(replay.time);
      return;
    }

    if (contextId) {
      playFromThisContext(contextId);
    }
    return;
  }

  const sentence = sentences[0];
  if (!sentence) {
    return;
  }

  if (isVideoPlaying && sentence.id === masterPlay) {
    handlePause();
    return;
  }

  handleFromHere(sentence.time);
}
