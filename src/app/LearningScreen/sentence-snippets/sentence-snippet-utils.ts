import {
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { getLoopTranscriptSegment } from '../utils/get-loop-transcript-segment';
import { getSecondsLoopedTranscriptData } from '../utils/get-seconds-looped-transcript-data';
import { getOverlappingText } from '../hooks/useOverlappingTextMemoized';
import { findApproxIndexForSnippet } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import {
  FocusRange,
  contractFocusRange,
  expandFocusRange,
  moveFocusRangeLeft,
  moveFocusRangeRight,
  snapFocusRangeToUnits,
} from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/snippet-focus-steps';

/**
 * Custom sentence snippets ("clips"): a snippet record with its own
 * start/end, made while reviewing a sentence. Stored in `content.snippets`
 * next to the 3 s / 1.5 s snippets, with `origin: 'sentence'` and no
 * reviewData. The data shape must match the Netflix extension exactly.
 */

export const SENTENCE_SNIPPET_MIN_LENGTH = 0.25;
export const SENTENCE_SNIPPET_MAX_LENGTH = 60;
export const SENTENCE_SNIPPET_NUDGE_SECONDS = 0.2;

export const SENTENCE_SNIPPET_TOO_SHORT_MESSAGE =
  'Hold longer to make a sentence snippet.';
export const SENTENCE_SNIPPET_UPDATED_MESSAGE = 'Sentence snippet updated.';
export const SENTENCE_SNIPPET_ALREADY_SAVED_MESSAGE =
  'This sentence snippet is already saved.';
export const SENTENCE_SNIPPET_NO_BASE_LANG_MESSAGE =
  "Can't save this sentence snippet: it has no translation.";

export const isSentenceSnippet = (
  snippet: Pick<Snippet, 'origin'> | null | undefined,
) => snippet?.origin === 'sentence';

/** Keep every snippet that is not a custom sentence snippet. */
export const withoutSentenceSnippets = <T extends Pick<Snippet, 'origin'>>(
  snippets: T[] | undefined | null,
): T[] => (snippets ?? []).filter((snippet) => !isSentenceSnippet(snippet));

export const roundToMs = (seconds: number) => Math.round(seconds * 1000) / 1000;

export type ClipRange = { start: number; end: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** A sentence covers `time` up to the next sentence, or the media end. */
export const getSentenceCoverage = (
  sentence: Pick<SentenceMapItemTypes, 'time' | 'nextSentence'>,
  mediaDuration: number | null,
): ClipRange => ({
  start: sentence.time,
  end: sentence.nextSentence ?? mediaDuration ?? Number.POSITIVE_INFINITY,
});

/**
 * Turn an L1+R2 hold into a clip range. The start is clamped to the
 * creation sentence; the end may run past the sentence end (up to 60 s and
 * the media end). Returns null when the clip is shorter than 0.25 s.
 */
export const finalizeHoldRange = ({
  pressTime,
  releaseTime,
  sentence,
  mediaDuration,
}: {
  pressTime: number;
  releaseTime: number;
  sentence: Pick<SentenceMapItemTypes, 'time' | 'nextSentence'>;
  mediaDuration: number | null;
}): ClipRange | null => {
  const coverage = getSentenceCoverage(sentence, mediaDuration);
  const start = clamp(
    Math.min(pressTime, releaseTime),
    coverage.start,
    coverage.end,
  );
  const maxEnd = Math.min(
    start + SENTENCE_SNIPPET_MAX_LENGTH,
    mediaDuration ?? Number.POSITIVE_INFINITY,
  );
  const end = clamp(Math.max(pressTime, releaseTime), start, maxEnd);

  if (end - start < SENTENCE_SNIPPET_MIN_LENGTH) {
    return null;
  }
  return { start: roundToMs(start), end: roundToMs(end) };
};

/**
 * Move one edge of a clip by `delta` seconds. The other edge never moves.
 * Limits: start >= 0, length within [0.25, 60], end <= mediaDuration.
 */
export const nudgeClipEdge = (
  range: ClipRange,
  edge: 'start' | 'end',
  delta: number,
  mediaDuration: number | null,
): ClipRange => {
  const mediaEnd = mediaDuration ?? Number.POSITIVE_INFINITY;
  if (edge === 'start') {
    const min = Math.max(0, range.end - SENTENCE_SNIPPET_MAX_LENGTH);
    const max = range.end - SENTENCE_SNIPPET_MIN_LENGTH;
    if (max < min) return range;
    return {
      start: roundToMs(clamp(range.start + delta, min, max)),
      end: range.end,
    };
  }
  const min = range.start + SENTENCE_SNIPPET_MIN_LENGTH;
  const max = Math.min(mediaEnd, range.start + SENTENCE_SNIPPET_MAX_LENGTH);
  if (max < min) return range;
  return {
    start: range.start,
    end: roundToMs(clamp(range.end + delta, min, max)),
  };
};

export type ClipText = {
  targetLang: string;
  baseLang: string;
  /** The app's guess, snapped to whole units; always a substring of targetLang. */
  suggestedFocusText: string;
  suggestedFocusRange: FocusRange | null;
  sentenceIds: string[];
  /** Character index in `targetLang` where each following sentence starts. */
  sentenceBoundaries: number[];
};

/**
 * The text of a clip: every sentence it overlaps in time, joined. Built from
 * the existing overlap pipeline fed the clip's own start/end.
 */
export const getClipText = ({
  range,
  secondsState,
  sentenceMap,
  mediaDuration,
  isTrimmed,
}: {
  range: ClipRange;
  secondsState: string[];
  sentenceMap: Record<string, SentenceMapItemTypes>;
  mediaDuration: number | null;
  isTrimmed: boolean;
}): ClipText | null => {
  if (!secondsState.length) return null;

  const segment = getLoopTranscriptSegment({
    secondsState,
    sentenceMap,
    startTime: range.start,
    endTime: range.end,
  })
    .filter(Boolean)
    // Fall back to `meaning` when a sentence has no baseLang.
    .map((sentence) => ({
      ...sentence,
      baseLang: sentence.baseLang || sentence.meaning || '',
    }));

  const overlaps = getSecondsLoopedTranscriptData({
    formattedTranscriptState: segment,
    loopStartTime: range.start,
    loopEndTime: range.end,
    mediaDuration,
  });
  if (overlaps.length === 0) return null;

  const { targetLang, baseLang, suggestedFocusText, suggestedFocusStartIndex } =
    getOverlappingText(overlaps, segment, isTrimmed);

  const sentenceIds = overlaps.map((item) => item.id);
  const separatorLength = !isTrimmed && sentenceIds.length > 1 ? 1 : 0;
  const sentenceBoundaries: number[] = [];
  let offset = 0;
  sentenceIds.forEach((id, index) => {
    if (index > 0) sentenceBoundaries.push(offset);
    offset += (sentenceMap[id]?.targetLang ?? '').length + separatorLength;
  });

  let suggestedFocusRange: FocusRange | null = null;
  if (
    suggestedFocusText &&
    typeof suggestedFocusStartIndex === 'number' &&
    suggestedFocusStartIndex >= 0
  ) {
    const snapped = snapFocusRangeToUnits(
      targetLang,
      {
        start: suggestedFocusStartIndex,
        end: suggestedFocusStartIndex + suggestedFocusText.length,
      },
      isTrimmed,
    );
    if (snapped.end > snapped.start) suggestedFocusRange = snapped;
  }

  return {
    targetLang,
    baseLang,
    suggestedFocusText: suggestedFocusRange
      ? targetLang.slice(suggestedFocusRange.start, suggestedFocusRange.end)
      : '',
    suggestedFocusRange,
    sentenceIds,
    sentenceBoundaries,
  };
};

export type ClipFocusMove = 'left' | 'right' | 'shrink' | 'grow';

const countUnits = (text: string, range: FocusRange, isTrimmed: boolean) =>
  isTrimmed
    ? range.end - range.start
    : text.slice(range.start, range.end).split(/\s+/).filter(Boolean).length;

/**
 * One Y/A or L1+Y/A step on a clip's focus, using the shared step logic.
 * Left/right keep the number of units (words, or characters for trimmed
 * languages); the result is always snapped to whole units.
 */
export const stepClipFocus = (
  text: string,
  range: FocusRange,
  move: ClipFocusMove,
  isTrimmed: boolean,
): FocusRange | null => {
  if (move === 'shrink' || move === 'grow') {
    const stepped = (move === 'shrink' ? contractFocusRange : expandFocusRange)(
      text,
      range,
      isTrimmed,
    );
    if (!stepped) return null;
    const snapped = snapFocusRangeToUnits(text, stepped, isTrimmed);
    return snapped.end > snapped.start ? snapped : null;
  }

  const moved = (move === 'left' ? moveFocusRangeLeft : moveFocusRangeRight)(
    text,
    range,
    isTrimmed,
  );
  if (!moved) return null;
  if (isTrimmed) return moved;

  const units = Math.max(1, countUnits(text, range, isTrimmed));
  let next: FocusRange = { start: moved.start, end: moved.start };
  for (let i = 0; i < units; i += 1) {
    const grown = expandFocusRange(text, next, isTrimmed);
    if (!grown) break;
    next = grown;
  }
  const snapped = snapFocusRangeToUnits(text, next, isTrimmed);
  if (snapped.end <= snapped.start) return null;
  if (snapped.start === range.start && snapped.end === range.end) return null;
  return snapped;
};

/** A focus the person set in this session, as indices into the clip text. */
export type FocusEdit = FocusRange & { text: string };

export type ResolvedFocus = {
  range: FocusRange | null;
  /** true: a person chose it (solid). false: only the app's guess (dashed). */
  isHumanSet: boolean;
};

const locateText = (
  text: string,
  query: string | undefined,
  hintStart?: number,
): FocusRange | null => {
  if (!query) return null;
  if (
    typeof hintStart === 'number' &&
    text.slice(hintStart, hintStart + query.length) === query
  ) {
    return { start: hintStart, end: hintStart + query.length };
  }
  const index = findApproxIndexForSnippet(text, query);
  if (index < 0) return null;
  return { start: index, end: Math.min(text.length, index + query.length) };
};

/**
 * Pick the focus to show, in order: an edit made this session, the saved
 * focusedText, the saved suggestedFocusText, the computed guess.
 */
export const resolveClipFocus = ({
  clipText,
  isTrimmed,
  sessionEdit,
  savedFocusedText,
  savedSuggestedFocusText,
}: {
  clipText: ClipText;
  isTrimmed: boolean;
  sessionEdit?: FocusEdit | null;
  savedFocusedText?: string;
  savedSuggestedFocusText?: string;
}): ResolvedFocus => {
  const text = clipText.targetLang;
  const snap = (range: FocusRange | null) => {
    if (!range) return null;
    const snapped = snapFocusRangeToUnits(text, range, isTrimmed);
    return snapped.end > snapped.start ? snapped : null;
  };

  const fromEdit = sessionEdit
    ? snap(locateText(text, sessionEdit.text, sessionEdit.start))
    : null;
  if (fromEdit) return { range: fromEdit, isHumanSet: true };

  const fromSavedFocus = snap(locateText(text, savedFocusedText));
  if (fromSavedFocus) return { range: fromSavedFocus, isHumanSet: true };

  const fromSavedSuggestion = snap(locateText(text, savedSuggestedFocusText));
  if (fromSavedSuggestion) {
    return { range: fromSavedSuggestion, isHumanSet: false };
  }

  if (clipText.suggestedFocusRange) {
    return { range: clipText.suggestedFocusRange, isHumanSet: false };
  }

  // No guess at all: start on the first unit so Y/A have something to move.
  const firstUnit = snap({ start: 0, end: 1 });
  return { range: firstUnit, isHumanSet: false };
};

/** Build the record sent to saveSnippet. Returns null when baseLang is empty. */
export const buildSentenceSnippetRecord = ({
  id,
  sentenceId,
  range,
  clipText,
  focusedText,
}: {
  id: string;
  sentenceId: string;
  range: ClipRange;
  clipText: ClipText;
  focusedText?: string;
}): Snippet | null => {
  if (!clipText.baseLang.trim()) return null;

  const start = roundToMs(range.start);
  const end = roundToMs(range.end);
  const record: Snippet = {
    id,
    time: roundToMs((start + end) / 2),
    start,
    end,
    sentenceId,
    origin: 'sentence',
    isContracted: false,
    isPreSnippet: false,
    targetLang: clipText.targetLang,
    baseLang: clipText.baseLang,
  };
  if (clipText.suggestedFocusText) {
    record.suggestedFocusText = clipText.suggestedFocusText;
  }
  if (focusedText && clipText.targetLang.includes(focusedText)) {
    record.focusedText = focusedText;
  }
  return record;
};

/**
 * Which focusedText to keep when re-saving a saved clip. A new edit wins;
 * otherwise the existing focusedText, if it is still inside the new text;
 * otherwise the human-set focus as currently shown.
 */
export const focusedTextForResave = ({
  sessionEdit,
  existingFocusedText,
  clipText,
  displayedFocus,
}: {
  sessionEdit?: FocusEdit | null;
  existingFocusedText?: string;
  clipText: ClipText;
  displayedFocus: ResolvedFocus;
}): string | undefined => {
  if (sessionEdit && displayedFocus.range) {
    return clipText.targetLang.slice(
      displayedFocus.range.start,
      displayedFocus.range.end,
    );
  }
  if (existingFocusedText && clipText.targetLang.includes(existingFocusedText)) {
    return existingFocusedText;
  }
  if (displayedFocus.isHumanSet && displayedFocus.range) {
    return clipText.targetLang.slice(
      displayedFocus.range.start,
      displayedFocus.range.end,
    );
  }
  return undefined;
};

const wordForms = (word: Pick<WordTypes, 'surfaceForm' | 'baseForm'>) =>
  [word.surfaceForm, word.baseForm].filter(
    (form): form is string => typeof form === 'string' && form.length > 0,
  );

/** Sentence snippets whose human-set focusedText contains the word. */
export const sentenceSnippetsFocusingWord = (
  word: Pick<WordTypes, 'surfaceForm' | 'baseForm'>,
  snippets: Snippet[] | undefined | null,
): Snippet[] => {
  const forms = wordForms(word);
  if (forms.length === 0) return [];
  return (snippets ?? []).filter(
    (snippet) =>
      isSentenceSnippet(snippet) &&
      Boolean(snippet.focusedText) &&
      forms.some((form) => snippet.focusedText!.includes(form)),
  );
};

/**
 * "Only words in custom snippets": keep a due word only when a sentence
 * snippet's focusedText contains its surface or base form. Suggested-only
 * focus and regular snippets don't count.
 */
export const isWordInCustomSnippetFocus = (
  word: Pick<WordTypes, 'surfaceForm' | 'baseForm'>,
  snippets: Snippet[] | undefined | null,
) => sentenceSnippetsFocusingWord(word, snippets).length > 0;

/**
 * The sentence snippet a word card should replay, preferring one made in the
 * word's own sentence.
 */
export const findSentenceSnippetForWord = (
  word: Pick<WordTypes, 'surfaceForm' | 'baseForm' | 'contexts'>,
  snippets: Snippet[] | undefined | null,
): (Snippet & ClipRange) | null => {
  const matches = sentenceSnippetsFocusingWord(word, snippets).filter(
    (snippet): snippet is Snippet & ClipRange =>
      typeof snippet.start === 'number' && typeof snippet.end === 'number',
  );
  if (matches.length === 0) return null;
  const contextId = word.contexts?.[0];
  return (
    matches.find((snippet) => snippet.sentenceId === contextId) ?? matches[0]
  );
};

// ---------------------------------------------------------------------------
// Drafts: unsaved clips, kept per content in localStorage.

export type SentenceSnippetDraft = {
  id: string;
  start: number;
  end: number;
  createdAt: number;
};

export type SentenceSnippetDrafts = Record<string, SentenceSnippetDraft[]>;

export const sentenceSnippetDraftsKey = (contentId: string) =>
  `ll-sentence-snippets:${contentId}`;

const isDraft = (value: unknown): value is SentenceSnippetDraft => {
  const draft = value as SentenceSnippetDraft;
  return (
    typeof draft?.id === 'string' &&
    typeof draft.start === 'number' &&
    typeof draft.end === 'number' &&
    typeof draft.createdAt === 'number'
  );
};

export const readSentenceSnippetDrafts = (
  contentId: string,
): SentenceSnippetDrafts => {
  try {
    const raw = window.localStorage.getItem(sentenceSnippetDraftsKey(contentId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const drafts: SentenceSnippetDrafts = {};
    Object.entries(parsed as Record<string, unknown>).forEach(
      ([sentenceId, list]) => {
        if (!Array.isArray(list)) return;
        const valid = list.filter(isDraft);
        if (valid.length) drafts[sentenceId] = valid;
      },
    );
    return drafts;
  } catch {
    return {};
  }
};

export const writeSentenceSnippetDrafts = (
  contentId: string,
  drafts: SentenceSnippetDrafts,
) => {
  try {
    const cleaned = Object.fromEntries(
      Object.entries(drafts).filter(([, list]) => list.length > 0),
    );
    const key = sentenceSnippetDraftsKey(contentId);
    if (Object.keys(cleaned).length === 0) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(cleaned));
    }
  } catch {
    // Storage can be unavailable (private mode, quota); drafts stay in memory.
  }
};
