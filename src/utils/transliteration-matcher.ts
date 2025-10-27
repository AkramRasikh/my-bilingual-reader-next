export const transliterationMatcher = (
  targetLang,
  transliteration,
  highlightStart,
  highlightEnd,
) => {
  // Split sentences into words
  const targetWords = targetLang.split(' ');
  const translitWords = transliteration.split(' ');

  // Map word indexes to their character positions
  let positions = [];
  let cursor = 0;
  for (let i = 0; i < targetWords.length; i++) {
    let start = cursor;
    let end = cursor + targetWords[i].length;
    positions.push({ start, end });
    cursor = end + 1; // +1 for the space
  }

  // Find which words are within the highlighted range
  const startIndex = positions.findIndex(
    (pos) => highlightStart >= pos.start && highlightStart <= pos.end,
  );
  const endIndex = positions.findLastIndex(
    (pos) => highlightEnd >= pos.start && highlightEnd <= pos.end,
  );

  // Handle invalid or partial highlights gracefully
  if (startIndex === -1 || endIndex === -1) return '';

  // Extract corresponding transliteration words
  const translitSegment = translitWords
    .slice(startIndex, endIndex + 1)
    .join(' ');

  return translitSegment;
};
