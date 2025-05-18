export const makeArrayUnique = (array) => {
  if (array.length === 0) {
    return [];
  }
  const setArr = [...new Set(array)];
  if (setArr?.length > 1) {
    return setArr.sort((a, b) => b.length - a.length);
  }
  return setArr;
};

export const useHighlightWordToWordBank = ({ pureWordsUnique }) => {
  const underlineWordsInSentence = (sentence) => {
    const masterBank = makeArrayUnique(pureWordsUnique);
    if (masterBank?.length === 0) return [{ text: sentence, style: {} }];

    const pattern = new RegExp(`(${masterBank.join('|')})`, 'g');

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
