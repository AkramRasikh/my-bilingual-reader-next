export const underlineWordsInSentence = (sentence, pureWordsMemoized) => {
  if (pureWordsMemoized?.length === 0) return [{ text: sentence, style: {} }];

  const pattern = new RegExp(`(${pureWordsMemoized.join('|')})`, 'g');

  const targetLangformatted = [] as any;

  sentence.split(pattern).forEach((segment) => {
    if (segment.match(pattern)) {
      targetLangformatted.push({
        text: segment,
        isSaved: true,
      });
    } else {
      targetLangformatted.push({ text: segment, isSaved: false });
    }
  });

  return targetLangformatted;
};
