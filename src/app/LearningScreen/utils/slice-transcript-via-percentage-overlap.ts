export const sliceTranscriptViaPercentageOverlap = (items) => {
  let result = '';

  for (const item of items) {
    const text = item.targetLang;
    if (!text) continue;

    const L = text.length;

    const startIndex = Math.floor(L * (item.startPoint / 100));
    const endIndex =
      Math.floor(L * (item.percentageOverlap / 100)) + startIndex;
    const safeStart = Math.min(startIndex, L);
    const safeEnd = Math.max(safeStart, Math.min(endIndex, L));

    result += text.substring(safeStart, safeEnd);
  }

  return result;
};
