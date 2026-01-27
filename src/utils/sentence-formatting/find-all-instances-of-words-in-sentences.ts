import { WordTypes } from '@/app/types/word-types';

export const findAllInstancesOfWordsInSentence = (
  sentence: string,
  wordState: WordTypes[],
) => {
  const results = [] as WordTypes[];
  if (wordState.length === 0) {
    return results;
  }

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
