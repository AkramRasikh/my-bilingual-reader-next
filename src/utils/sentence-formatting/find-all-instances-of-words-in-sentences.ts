import { WordTypes } from '@/app/types/word-types';

export const findAllInstancesOfWordsInSentence = (
  sentence: string,
  wordState: WordTypes[],
) => {
  const results = [] as WordTypes[];

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
