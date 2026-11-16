// Splits a saved word into clue chips using the breakdown pieces of a sentence
// it came from. Parts of the word that match no piece become "gap" chips
// (index null) so the whole word can still be revealed clue by clue.

export type ClueSegment = {
  surfaceForm: string;
  /** Breakdown piece index (drives the colour), or null for a gap. */
  index: number | null;
};

type ClueSentence = {
  id?: string;
  index?: number;
  sentenceStructure?: string;
  targetLang?: string;
  vocab?: { surfaceForm?: string }[];
};

type Split = { segments: ClueSegment[]; matched: number };

function comparableChars(text: string) {
  return text.replace(/[的得地]/g, '的');
}

function comparableToken(token: string) {
  return token
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function pushGap(segments: ClueSegment[], text: string, joiner: string) {
  const last = segments[segments.length - 1];
  if (last && last.index === null) {
    last.surfaceForm = `${last.surfaceForm}${joiner}${text}`;
  } else {
    segments.push({ surfaceForm: text, index: null });
  }
}

function splitByCharacters(word: string, sentence: ClueSentence): Split {
  const chars = word.replace(/\s/g, '');
  const target = comparableChars(chars);
  const pieces = (sentence.vocab ?? []).flatMap((item, index) => {
    const form = comparableChars((item.surfaceForm ?? '').replace(/\s/g, ''));
    return form ? [{ form, index }] : [];
  });

  const segments: ClueSegment[] = [];
  let matched = 0;
  let position = 0;
  while (position < chars.length) {
    let best: { form: string; index: number } | null = null;
    for (const piece of pieces) {
      if (
        target.startsWith(piece.form, position) &&
        (!best || piece.form.length > best.form.length)
      ) {
        best = piece;
      }
    }
    if (best) {
      segments.push({
        surfaceForm: chars.slice(position, position + best.form.length),
        index: best.index,
      });
      matched += best.form.length;
      position += best.form.length;
    } else {
      pushGap(segments, chars[position], '');
      position += 1;
    }
  }
  return { segments, matched };
}

function splitByWords(word: string, sentence: ClueSentence): Split {
  const tokens = word.trim().split(/\s+/).filter(Boolean);
  const targets = tokens.map(comparableToken);
  const pieces = (sentence.vocab ?? []).flatMap((item, index) => {
    const forms = (item.surfaceForm ?? '')
      .trim()
      .split(/\s+/)
      .map(comparableToken)
      .filter(Boolean);
    return forms.length ? [{ forms, index }] : [];
  });

  const segments: ClueSegment[] = [];
  let matched = 0;
  let position = 0;
  while (position < tokens.length) {
    let best: { forms: string[]; index: number } | null = null;
    for (const piece of pieces) {
      const fits = piece.forms.every(
        (form, offset) => targets[position + offset] === form,
      );
      if (fits && (!best || piece.forms.length > best.forms.length)) {
        best = piece;
      }
    }
    if (best) {
      segments.push({
        surfaceForm: tokens
          .slice(position, position + best.forms.length)
          .join(' '),
        index: best.index,
      });
      matched += best.forms.length;
      position += best.forms.length;
    } else {
      pushGap(segments, tokens[position], ' ');
      position += 1;
    }
  }
  return { segments, matched };
}

function offsetSegments(segments: ClueSegment[], offset: number) {
  return segments.map((segment) =>
    segment.index === null
      ? segment
      : { ...segment, index: segment.index + offset },
  );
}

// A saved word can run across a subtitle line break. Re-split the gap at the
// start of the word with the previous sentence's pieces and the gap at the end
// with the next sentence's. Gaps in the middle stay as they are.
function fillEdgeGaps(
  segments: ClueSegment[],
  main: ClueSentence,
  prev: ClueSentence | null,
  next: ClueSentence | null,
  split: (text: string, sentence: ClueSentence) => Split,
  joiner: string,
) {
  const mainCount = main.vocab?.length ?? 0;
  const nextCount = next?.vocab?.length ?? 0;
  const fill = (
    gap: ClueSegment,
    neighbour: ClueSentence | null,
    offset: number,
  ) => {
    if (!neighbour) return [gap];
    const result = split(gap.surfaceForm, neighbour);
    return result.matched > 0 ? offsetSegments(result.segments, offset) : [gap];
  };

  let filled = [...segments];
  const last = filled[filled.length - 1];
  if (filled.length > 1 && last?.index === null) {
    filled = [...filled.slice(0, -1), ...fill(last, next, mainCount)];
  }
  const first = filled[0];
  if (filled.length > 1 && first?.index === null) {
    filled = [
      ...fill(first, prev, mainCount + nextCount),
      ...filled.slice(1),
    ];
  }
  // Keep neighbouring gaps merged after filling.
  return filled.reduce<ClueSegment[]>((out, segment) => {
    const tail = out[out.length - 1];
    if (tail && tail.index === null && segment.index === null) {
      tail.surfaceForm = `${tail.surfaceForm}${joiner}${segment.surfaceForm}`;
    } else {
      out.push({ ...segment });
    }
    return out;
  }, []);
}

function usableSplit(split: Split) {
  return split.matched > 0 && split.segments.length >= 2;
}

function sentenceTextIncludes(text: string | undefined, word: string) {
  if (!text) return false;
  return text
    .replace(/[\s\-—–]/g, '')
    .toLowerCase()
    .includes(word.replace(/\s/g, '').toLowerCase());
}

export function findLooseClueSegments(
  word: string,
  sentences: ClueSentence[],
  contextSentence: ClueSentence | null | undefined,
  splitIntoCharacters: boolean,
): ClueSegment[] | null {
  const target = word?.trim();
  if (!target) {
    return null;
  }
  const splitText = (text: string, sentence: ClueSentence) =>
    splitIntoCharacters
      ? splitByCharacters(text, sentence)
      : splitByWords(text, sentence);
  const split = (sentence: ClueSentence) => splitText(target, sentence);
  const brokenDown = (sentence?: ClueSentence | null) =>
    Boolean(sentence?.sentenceStructure && sentence.vocab?.length);
  const neighbour = (sentence: ClueSentence, step: number) => {
    if (typeof sentence.index !== 'number') return null;
    const found = sentences.find(
      (other) => other.index === sentence.index! + step,
    );
    return found && brokenDown(found) ? found : null;
  };
  const withNeighbours = (sentence: ClueSentence, segments: ClueSegment[]) =>
    fillEdgeGaps(
      segments,
      sentence,
      neighbour(sentence, -1),
      neighbour(sentence, 1),
      splitText,
      splitIntoCharacters ? '' : ' ',
    );

  if (brokenDown(contextSentence)) {
    const fromContext = split(contextSentence!);
    if (usableSplit(fromContext)) {
      return withNeighbours(contextSentence!, fromContext.segments);
    }
  }

  const candidates = sentences
    .filter(
      (sentence) =>
        brokenDown(sentence) &&
        !(contextSentence?.id && sentence.id === contextSentence.id),
    )
    .map((sentence) => ({
      sentence,
      result: split(sentence),
      textMatch: sentenceTextIncludes(sentence.targetLang, target),
      distance:
        typeof contextSentence?.index === 'number' &&
        typeof sentence.index === 'number'
          ? Math.abs(sentence.index - contextSentence.index)
          : Number.MAX_SAFE_INTEGER,
    }))
    .filter((candidate) => usableSplit(candidate.result));

  candidates.sort(
    (a, b) =>
      b.result.matched - a.result.matched ||
      Number(b.textMatch) - Number(a.textMatch) ||
      a.distance - b.distance,
  );
  const best = candidates[0];
  return best ? withNeighbours(best.sentence, best.result.segments) : null;
}
