export interface TranscriptLine {
  id: string;
  targetLang?: string | null;
}

export interface TranscriptContent {
  content?: TranscriptLine[] | null;
}

export interface SentenceWindow {
  previous: string | null;
  current: string | null;
  next: string | null;
}

const emptyWindow = (): SentenceWindow => ({
  previous: null,
  current: null,
  next: null,
});

const lineText = (line: TranscriptLine | undefined): string | null => {
  const text = line?.targetLang?.trim();
  return text ? text : null;
};

export const findSentenceWindow = (
  contextId: string | undefined | null,
  contentState: TranscriptContent[],
  sentencesState: TranscriptLine[] = [],
): SentenceWindow => {
  if (!contextId) return emptyWindow();

  for (const topic of contentState) {
    const lines = topic.content ?? [];
    const index = lines.findIndex((line) => line.id === contextId);
    if (index === -1) continue;
    return {
      previous: lineText(lines[index - 1]),
      current: lineText(lines[index]),
      next: lineText(lines[index + 1]),
    };
  }

  const generated = sentencesState.find((sentence) => sentence.id === contextId);
  if (generated) {
    return {
      previous: null,
      current: lineText(generated),
      next: null,
    };
  }

  return emptyWindow();
};
