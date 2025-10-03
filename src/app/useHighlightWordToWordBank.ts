export const useHighlightWordToWordBank = ({ pureWordsState }) => {
  const underlineWordsInSentence = (sentence) => {
    if (pureWordsState?.length === 0) return [{ text: sentence, style: {} }];

    const pattern = new RegExp(`(${pureWordsState.join('|')})`, 'g');

    const segments = [] as any;

    sentence.split(pattern).forEach((segment) => {
      if (segment.match(pattern)) {
        segments.push({
          text: segment,
          style: { textDecorationLine: 'underline' },
          id: 'targetWord',
        });
      } else {
        segments.push({ text: segment, style: {} });
      }
    });

    return segments;
  };

  return {
    underlineWordsInSentence,
  };
};
