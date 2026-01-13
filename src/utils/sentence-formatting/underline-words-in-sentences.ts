export const underlineWordsInSentence = (sentence, pureWordsMemoized) => {
  if (pureWordsMemoized?.length === 0) return [{ text: sentence, style: {} }];

  const pattern = new RegExp(`(${pureWordsMemoized.join('|')})`, 'g');

  const targetLangformatted = [] as any;

  sentence.split(pattern).forEach((segment) => {
    if (segment.match(pattern)) {
      targetLangformatted.push({
        text: segment,
        style: { textDecorationLine: 'underline' },
        id: 'targetWord',
      });
    } else {
      targetLangformatted.push({ text: segment, style: {} });
    }
  });

  return targetLangformatted;
};
