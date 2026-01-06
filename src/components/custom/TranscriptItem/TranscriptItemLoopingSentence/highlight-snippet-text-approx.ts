function findApproxIndexForSnippet(text: string, query: string) {
  // If exact match exists, return it
  const exact = text.indexOf(query);
  if (exact !== -1) return exact;

  // Otherwise fuzzy: sliding window + similarity scoring
  let bestIndex = 0;
  let bestScore = 0;

  const qLen = query.length;

  for (let i = 0; i <= text.length - qLen; i++) {
    const chunk = text.slice(i, i + qLen);

    // similarity = proportion of matching characters
    let score = 0;
    for (let j = 0; j < qLen; j++) {
      if (chunk[j] === query[j]) score++;
    }
    score = score / qLen;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestScore > 0.4 ? bestIndex : -1;
}

export const highlightSnippetTextApprox = (
  fullText: string,
  slicedText: string,
  isLoadingSaveSnippetState: boolean,
  startIndexKeyState: number,
  lengthAdjustmentState: number,
) => {
  const index = findApproxIndexForSnippet(fullText, slicedText);
  if (index === -1) return fullText; // no suitable match

  let textStartIndex = index + startIndexKeyState;
  let textEndIndex = textStartIndex + slicedText.length + lengthAdjustmentState;

  // Ensure textStartIndex is within bounds
  textStartIndex = Math.max(0, Math.min(textStartIndex, fullText.length));

  // Ensure textEndIndex is within bounds and not before textStartIndex
  textEndIndex = Math.max(
    textStartIndex,
    Math.min(textEndIndex, fullText.length),
  );

  const before = fullText.slice(0, textStartIndex);
  const textMatch = fullText.slice(textStartIndex, textEndIndex);
  const after = fullText.slice(textEndIndex);

  const opacityClass = isLoadingSaveSnippetState ? 'opacity-50' : '';
  return {
    htmlText: `${before}<span data-testid="highlighted-snippet-text" class="bg-yellow-200 shadow-yellow-500 shadow-sm px-1 rounded ${opacityClass}">${textMatch}</span>${after}`,
    textMatch,
    matchStartKey: textStartIndex,
    matchEndKey: textEndIndex,
  };
};
