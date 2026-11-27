/**
 * Step logic for moving a focus highlight across a snippet's text, one unit
 * at a time. A unit is a whole word, or a single character for trimmed
 * languages (Chinese/Japanese). Shared by `useSnippetHandleActionsHook` (3 s
 * snippets) and custom sentence snippets.
 *
 * Each helper takes the current `[start, end)` range in `text` and returns the
 * next range, or `null` when the step is not possible.
 */
export type FocusRange = { start: number; end: number };

const isSpace = (char: string | undefined) =>
  char !== undefined && /\s/.test(char);

/** Shrink the focus from its right edge by one unit. */
export const contractFocusRange = (
  text: string,
  { start, end }: FocusRange,
  isTrimmed: boolean,
): FocusRange | null => {
  if (!(end > start + 1)) return null;

  if (!isTrimmed) {
    let cursor = end - 1;
    while (cursor >= start && isSpace(text[cursor])) cursor -= 1;
    while (cursor >= start && !isSpace(text[cursor])) cursor -= 1;
    return { start, end: Math.max(start + 1, cursor + 1) };
  }

  return { start, end: end - 1 };
};

/** Grow the focus from its right edge by one unit. */
export const expandFocusRange = (
  text: string,
  { start, end }: FocusRange,
  isTrimmed: boolean,
): FocusRange | null => {
  if (!(end < text.length)) return null;

  if (!isTrimmed) {
    let cursor = end;
    while (cursor < text.length && isSpace(text[cursor])) cursor += 1;
    while (cursor < text.length && !isSpace(text[cursor])) cursor += 1;
    return { start, end: cursor };
  }

  return { start, end: end + 1 };
};

/** Move the whole focus one unit left, keeping its length. */
export const moveFocusRangeLeft = (
  text: string,
  { start, end }: FocusRange,
  isTrimmed: boolean,
): FocusRange | null => {
  if (start <= 0) return null;
  const length = end - start;

  if (!isTrimmed) {
    let cursor = start - 1;
    while (cursor >= 0 && isSpace(text[cursor])) cursor -= 1;
    while (cursor >= 0 && !isSpace(text[cursor])) cursor -= 1;
    const previousWordStart = Math.max(0, cursor + 1);
    return { start: previousWordStart, end: previousWordStart + length };
  }

  return { start: start - 1, end: end - 1 };
};

/** Move the whole focus one unit right, keeping its length. */
export const moveFocusRangeRight = (
  text: string,
  { start, end }: FocusRange,
  isTrimmed: boolean,
): FocusRange | null => {
  if (end >= text.length) return null;
  const length = end - start;

  if (!isTrimmed) {
    let cursor = start + 1;
    while (cursor < text.length && !isSpace(text[cursor])) cursor += 1;
    while (cursor < text.length && isSpace(text[cursor])) cursor += 1;
    const nextWordStart = Math.min(cursor, text.length - 1);
    return { start: nextWordStart, end: nextWordStart + length };
  }

  return { start: start + 1, end: end + 1 };
};

/**
 * Snap a range to whole units: trim surrounding whitespace, then (for
 * space-separated languages) widen to the edges of any word it cuts through.
 */
export const snapFocusRangeToUnits = (
  text: string,
  range: FocusRange,
  isTrimmed: boolean,
): FocusRange => {
  let start = Math.max(0, Math.min(range.start, text.length));
  let end = Math.max(start, Math.min(range.end, text.length));

  while (start < end && isSpace(text[start])) start += 1;
  while (end > start && isSpace(text[end - 1])) end -= 1;

  if (!isTrimmed && end > start) {
    while (start > 0 && !isSpace(text[start - 1])) start -= 1;
    while (end < text.length && !isSpace(text[end])) end += 1;
  }

  return { start, end };
};
