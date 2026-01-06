import { OverlappingSnippetData } from '@/app/types/shared-types';

export const sliceTranscriptViaPercentageOverlap = (
  items: OverlappingSnippetData[],
  addSentenceSpace = false,
) => {
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

    const extractedText = text.substring(safeStart, safeEnd);
    result += extractedText;

    // Add space after each sentence for languages that use spaces between words
    if (addSentenceSpace && extractedText) {
      result += ' ';
    }
  }

  return result;
};
