export type PhraseBreakdownPiece = {
  surfaceForm: string;
  index: number;
};

type VocabPiece = {
  surfaceForm?: string;
};

function comparable(text: string) {
  return text.replace(/[的得地]/g, '的');
}

function findSpan(
  target: string,
  pieces: PhraseBreakdownPiece[],
  join: (parts: string[]) => string,
): PhraseBreakdownPiece[] | 'single' | null {
  const comparableTarget = comparable(target);
  for (let start = 0; start < pieces.length; start++) {
    const parts: string[] = [];
    for (let end = start; end < pieces.length; end++) {
      parts.push(pieces[end].surfaceForm);
      const joined = comparable(join(parts));
      if (joined === comparableTarget) {
        return end > start ? pieces.slice(start, end + 1) : 'single';
      }
      if (!comparableTarget.startsWith(joined)) {
        break;
      }
    }
  }
  return null;
}

export function findBreakdownPiecesForPhrase(
  phrase: string,
  vocab: VocabPiece[] | undefined,
): PhraseBreakdownPiece[] | null {
  const target = phrase?.trim();
  if (!target || !vocab?.length) {
    return null;
  }

  const pieces = vocab.flatMap((item, index) => {
    const surfaceForm = item.surfaceForm?.trim();
    return surfaceForm ? [{ surfaceForm, index }] : [];
  });

  const compact = findSpan(target, pieces, (parts) => parts.join(''));
  if (compact === 'single') {
    return null;
  }
  if (compact) {
    return compact;
  }

  const spaced = findSpan(target, pieces, (parts) => parts.join(' '));
  return spaced && spaced !== 'single' ? spaced : null;
}

type BreakdownSentence = {
  id?: string;
  index?: number;
  sentenceStructure?: string;
  targetLang?: string;
  vocab?: VocabPiece[];
};

function sentenceTextIncludesPhrase(text: string | undefined, phrase: string) {
  if (!text) {
    return false;
  }
  const compactText = text.replace(/[\s\-—–]/g, '');
  const compactPhrase = phrase.replace(/\s/g, '');
  return compactText.includes(compactPhrase);
}

export function findSavedWordBreakdown(
  phrase: string,
  sentences: BreakdownSentence[],
  contextSentence?: BreakdownSentence | null,
): PhraseBreakdownPiece[] | null {
  if (contextSentence?.sentenceStructure) {
    const fromContext = findBreakdownPiecesForPhrase(
      phrase,
      contextSentence.vocab,
    );
    if (fromContext) {
      return fromContext;
    }
  }

  const candidates: {
    pieces: PhraseBreakdownPiece[];
    distance: number;
    textMatch: boolean;
  }[] = [];

  for (const sentence of sentences) {
    if (
      !sentence.sentenceStructure ||
      (contextSentence?.id && sentence.id === contextSentence.id)
    ) {
      continue;
    }
    const pieces = findBreakdownPiecesForPhrase(phrase, sentence.vocab);
    if (!pieces) {
      continue;
    }
    const distance =
      typeof contextSentence?.index === 'number' &&
      typeof sentence.index === 'number'
        ? Math.abs(sentence.index - contextSentence.index)
        : Number.MAX_SAFE_INTEGER;
    candidates.push({
      pieces,
      distance,
      textMatch: sentenceTextIncludesPhrase(sentence.targetLang, phrase),
    });
  }

  const textMatches = candidates.filter((candidate) => candidate.textMatch);
  const pool = textMatches.length > 0 ? textMatches : candidates;
  pool.sort((a, b) => a.distance - b.distance);
  return pool[0]?.pieces ?? null;
}

function sentenceTextEqualsPhrase(text: string, phrase: string) {
  const compactText = text.replace(/[\s\-—–]/g, '');
  const compactPhrase = phrase.replace(/\s/g, '');
  return compactText === compactPhrase;
}

export type SentencePhrasePart = {
  text: string;
  highlighted: boolean;
};

const SENTENCE_GAP = /[\s\-—–]/;

export function splitSentenceAroundPhrase(
  sentence: string,
  phrase: string,
): SentencePhrasePart[] {
  const text = sentence ?? '';
  const target = phrase?.trim() ?? '';
  if (!text) {
    return [];
  }
  if (!target) {
    return [{ text, highlighted: false }];
  }

  const needle = comparable(target.replace(/\s/g, ''));
  if (!needle) {
    return [{ text, highlighted: false }];
  }

  const positions: number[] = [];
  let compact = '';
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (SENTENCE_GAP.test(char)) {
      continue;
    }
    positions.push(index);
    compact += comparable(char);
  }

  const matchAt = compact.indexOf(needle);
  if (matchAt < 0) {
    return [{ text, highlighted: false }];
  }

  const start = positions[matchAt];
  const end = positions[matchAt + needle.length - 1] + 1;
  const parts: SentencePhrasePart[] = [];
  if (start > 0) {
    parts.push({ text: text.slice(0, start), highlighted: false });
  }
  parts.push({ text: text.slice(start, end), highlighted: true });
  if (end < text.length) {
    parts.push({ text: text.slice(end), highlighted: false });
  }
  return parts;
}

export function findWordContextSentence(
  phrase: string,
  sentences: BreakdownSentence[],
  contextSentence?: BreakdownSentence | null,
): string | null {
  const target = phrase?.trim();
  if (!target) {
    return null;
  }

  const usableText = (sentence?: BreakdownSentence | null) => {
    const text = sentence?.targetLang?.trim();
    if (!text || sentenceTextEqualsPhrase(text, target)) {
      return null;
    }
    return sentenceTextIncludesPhrase(text, target) ? text : null;
  };

  const linkedText = usableText(contextSentence);
  if (linkedText) {
    return linkedText;
  }

  let best: { text: string; distance: number } | null = null;
  for (const sentence of sentences) {
    if (contextSentence?.id && sentence.id === contextSentence.id) {
      continue;
    }
    const text = usableText(sentence);
    if (!text) {
      continue;
    }
    const distance =
      typeof contextSentence?.index === 'number' &&
      typeof sentence.index === 'number'
        ? Math.abs(sentence.index - contextSentence.index)
        : Number.MAX_SAFE_INTEGER;
    if (!best || distance < best.distance) {
      best = { text, distance };
    }
  }

  return best?.text ?? null;
}
