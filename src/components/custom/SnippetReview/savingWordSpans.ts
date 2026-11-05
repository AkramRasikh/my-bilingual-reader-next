export type SavingWordSpan = {
  start: number;
  end: number;
  text: string;
};

export function normalizeSavingWordText(text: string) {
  return text.trim().toLowerCase();
}

export function middleIndexOfSavingWordSpan(
  span: Pick<SavingWordSpan, 'start' | 'end'>,
) {
  const start = Math.min(span.start, span.end);
  const end = Math.max(span.start, span.end);
  return Math.floor((start + end) / 2);
}

export function savingWordSpanCoversIndex(
  span: Pick<SavingWordSpan, 'start' | 'end'>,
  index: number,
) {
  const start = Math.min(span.start, span.end);
  const end = Math.max(span.start, span.end);
  return index >= start && index <= end;
}

export function isDuplicateSavingWord(
  inflight: SavingWordSpan[],
  next: SavingWordSpan,
) {
  const nextText = normalizeSavingWordText(next.text);
  return inflight.some((span) => {
    if (span.start === next.start && span.end === next.end) return true;
    if (!nextText) return false;
    return normalizeSavingWordText(span.text) === nextText;
  });
}

export function sameSavingWordSpans(
  current: SavingWordSpan[] | undefined,
  next: SavingWordSpan[] | undefined,
) {
  const left = current ?? [];
  const right = next ?? [];
  if (left.length !== right.length) return false;
  return left.every((span, index) => {
    const other = right[index];
    return (
      span.start === other.start &&
      span.end === other.end &&
      span.text === other.text
    );
  });
}
