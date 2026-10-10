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
