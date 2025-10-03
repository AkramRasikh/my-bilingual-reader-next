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
