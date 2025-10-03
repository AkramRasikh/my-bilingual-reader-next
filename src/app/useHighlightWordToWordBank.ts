export const findAllInstances = (sentence, wordState) => {
  const results = [];

  wordState.forEach((wordData) => {
    if (
      sentence.includes(wordData.baseForm) ||
      sentence.includes(wordData.surfaceForm)
    ) {
      results.push(wordData);
    }
  });

  return results;
};

export const useHighlightWordToWordBank = ({ pureWordsState }) => {
  const underlineWordsInSentence = (sentence) => {
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

  return {
    underlineWordsInSentence,
  };
};
