function findApproxIndex(text, query) {
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

export function highlightSnippetTextApprox(
  fullText,
  slicedText,
  isLoadingSaveSnippetState,
  startIndexKeyState,
  endIndexKeyState,
) {
  const index = findApproxIndex(fullText, slicedText);
  if (index === -1) return fullText; // no suitable match

  const before = fullText.slice(0, index + startIndexKeyState);
  const match = fullText.slice(
    index + startIndexKeyState,
    index + endIndexKeyState + slicedText.length,
  );
  const after = fullText.slice(index + endIndexKeyState + slicedText.length);

  const opacityClass = isLoadingSaveSnippetState ? 'opacity-50' : '';
  return {
    htmlText: `
        ${before}
        <span data-testid="highlighted-snippet-text" class="bg-yellow-200 shadow-yellow-500 shadow-sm px-1 rounded ${opacityClass}">
            ${match}
        </span>
        ${after}
    `,
    textMatch: match,
    matchStartKey: index + startIndexKeyState,
    matchEndKey: index + endIndexKeyState + slicedText.length,
  };
}
