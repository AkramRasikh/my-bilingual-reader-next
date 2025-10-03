export const underlineWordsInSentence = (sentence, pureWordsState) => {
  if (pureWordsState?.length === 0) return [{ text: sentence, style: {} }];

  const pattern = new RegExp(`(${pureWordsState.join('|')})`, 'g');

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
