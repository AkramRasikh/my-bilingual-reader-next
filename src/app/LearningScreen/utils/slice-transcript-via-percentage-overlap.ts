import { OverlappingSnippetData } from '@/app/types/shared-types';

export const sliceTranscriptViaPercentageOverlap = (
  items: OverlappingSnippetData[],
  addSentenceSpace = false,
  characterBased = true,
) => {
  let result = '';
  let suggestedFocusStartIndex = -1;
  let sourceOffset = 0;

  for (const [index, item] of items.entries()) {
    const text = item.targetLang;
    if (!text) {
      continue;
    }

    const L = text.length;

    const startIndex = Math.floor(L * (item.startPoint / 100));
    const endIndex =
      Math.floor(L * (item.percentageOverlap / 100)) + startIndex;
    const safeStart = Math.min(startIndex, L);
    const safeEnd = Math.max(safeStart, Math.min(endIndex, L));

    let extractedText = text.substring(safeStart, safeEnd);
    let leftTrimChars = 0;

    if (!characterBased && extractedText) {
      const startsInsideWord =
        safeStart > 0 &&
        !/\s/.test(text[safeStart - 1]) &&
        !/\s/.test(text[safeStart]);
      const endsInsideWord =
        safeEnd < L && !/\s/.test(text[safeEnd - 1]) && !/\s/.test(text[safeEnd]);

      if (startsInsideWord) {
        const leftWord = extractedText.match(/^\S+/);
        leftTrimChars = leftWord ? leftWord[0].length : 0;
        extractedText = extractedText.replace(/^\S+/, '');
      }
      if (endsInsideWord) {
        if (index === items.length - 1) {
          extractedText = extractedText.replace(/\S+$/, '');
        } else {
          // For non-final segments, complete the trailing word so boundary
          // joins like "un" + "peu" are preserved.
          const trailingPart = text.slice(safeEnd).match(/^\S+/)?.[0] ?? '';
          extractedText += trailingPart;
        }
      }
    }

    if (suggestedFocusStartIndex === -1 && extractedText) {
      suggestedFocusStartIndex = sourceOffset + safeStart + leftTrimChars;
    }

    result += extractedText;

    // Add space after each sentence for languages that use spaces between words
    if (addSentenceSpace && extractedText) {
      result += ' ';
    }

    sourceOffset += text.length;
    if (addSentenceSpace && index < items.length - 1) {
      sourceOffset += 1;
    }
  }

  return {
    suggestedFocusText: result,
    suggestedFocusStartIndex,
  };
};
