import { WordTypes } from '@/app/types/word-types';

export const underlineWordsInSentence = (
  sentence: string,
  pureWordsMemoized: string[],
) => {
  if (pureWordsMemoized?.length === 0)
    return [{ text: sentence, isSaved: false }];

  const pattern = new RegExp(`(${pureWordsMemoized.join('|')})`, 'g');

  const matchedWords: string[] = [];
  const targetLangformatted: { text: string; isSaved: boolean }[] = [];

  sentence.split(pattern).forEach((segment) => {
    if (segment.match(pattern)) {
      targetLangformatted.push({
        text: segment,
        isSaved: true,
      });
      if (!matchedWords.includes(segment)) {
        matchedWords.push(segment);
      }
    } else {
      targetLangformatted.push({ text: segment, isSaved: false });
    }
  });

  return targetLangformatted;
};

export const underlineWordsInSentenceNew = (
  sentence: string,
  wordsFromThisSentence: WordTypes[],
) => {
  const splitSentence = sentence.split('').map((char, charIndex) => ({
    text: char,
    index: charIndex,
    savedWords: [],
  }));

  wordsFromThisSentence.forEach((wordData) => {
    // Check baseForm
    let index = sentence.indexOf(wordData.baseForm);
    while (index !== -1) {
      // Mark all character positions covered by this word
      for (let i = index; i < index + wordData.baseForm.length; i++) {
        // console.log('## PUSHING 1');

        splitSentence[i].savedWords.push(wordData.id);
      }
      index = sentence.indexOf(wordData.baseForm, index + 1);
    }

    // Check surfaceForm (if different from baseForm)
    if (wordData.surfaceForm !== wordData.baseForm) {
      let index = sentence.indexOf(wordData.surfaceForm);
      while (index !== -1) {
        // Mark all character positions covered by this word
        for (let i = index; i < index + wordData.surfaceForm.length; i++) {
          // console.log('## PUSHING 2');
          splitSentence[i].savedWords.push(wordData.id);
        }
        index = sentence.indexOf(wordData.surfaceForm, index + 1);
      }
    }
  });

  // console.log('## splitSentence', splitSentence);

  return splitSentence;
};
