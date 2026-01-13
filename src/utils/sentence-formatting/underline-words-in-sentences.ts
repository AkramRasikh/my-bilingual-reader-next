import { WordTypes } from '@/app/types/word-types';

export const underlineWordsInSentenceLegacy = (
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

export const underlineWordsInSentence = (
  sentence: string,
  wordsFromThisSentence: WordTypes[],
) => {
  if (wordsFromThisSentence?.length === 0 || sentence.length === 0) {
    return [{ text: sentence, savedWords: [] }];
  }

  const splitSentence = sentence.split('').map((char, charIndex) => ({
    text: char,
    index: charIndex,
    savedWords: [] as WordTypes['id'][],
  }));

  // Helper function to mark word occurrences
  const markWordOccurrences = (wordForm: string, wordId: WordTypes['id']) => {
    let index = sentence.indexOf(wordForm);
    while (index !== -1) {
      // Mark all character positions covered by this word
      for (let i = index; i < index + wordForm.length; i++) {
        if (!splitSentence[i].savedWords.includes(wordId)) {
          splitSentence[i].savedWords.push(wordId);
        }
      }
      index = sentence.indexOf(wordForm, index + 1);
    }
  };

  wordsFromThisSentence.forEach((wordData) => {
    markWordOccurrences(wordData.baseForm, wordData.id);

    if (wordData.surfaceForm !== wordData.baseForm) {
      markWordOccurrences(wordData.surfaceForm, wordData.id);
    }
  });

  // POST-PROCESSING: Chunk adjacent characters with identical savedWords
  const chunked: Array<{
    text: string;
    savedWords: string[];
  }> = [];

  let currentChunk = {
    text: splitSentence[0].text,
    savedWords: splitSentence[0].savedWords,
  };

  for (let i = 1; i < splitSentence.length; i++) {
    const current = splitSentence[i];
    const prev = splitSentence[i - 1];

    // Check if savedWords arrays are identical (handles overlaps correctly)
    const isSameWords =
      current.savedWords.length === prev.savedWords.length &&
      current.savedWords.every((id, idx) => id === prev.savedWords[idx]);

    if (isSameWords) {
      // Merge into current chunk
      currentChunk.text += current.text;
    } else {
      // Save current chunk and start new one
      chunked.push(currentChunk);
      currentChunk = {
        text: current.text,
        savedWords: current.savedWords,
      };
    }
  }

  chunked.push(currentChunk);

  return chunked;
};
