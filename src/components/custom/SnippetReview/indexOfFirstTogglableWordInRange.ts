export type TogglableWordSpan = {
  index?: number;
  endIndex?: number;
};

export function indexOfFirstTogglableWordInRange(
  words: TogglableWordSpan[],
  matchStartKey: number,
  matchEndKey: number,
): number {
  if (
    words.length === 0 ||
    !Number.isFinite(matchStartKey) ||
    !Number.isFinite(matchEndKey)
  ) {
    return 0;
  }

  const index = words.findIndex((word) => {
    if (typeof word.index !== 'number') return false;
    const end = typeof word.endIndex === 'number' ? word.endIndex : word.index;
    return end >= matchStartKey && word.index <= matchEndKey;
  });

  return index >= 0 ? index : 0;
}
