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
  if (wordsFromThisSentence?.length === 0) {
    return [{ text: sentence, savedWords: [] }];
  }

  const splitSentence = sentence.split('').map((char, charIndex) => ({
    text: char,
    index: charIndex,
    savedWords: [] as string[],
  }));

  wordsFromThisSentence.forEach((wordData) => {
    // Check baseForm
    let index = sentence.indexOf(wordData.baseForm);
    while (index !== -1) {
      // Mark all character positions covered by this word
      for (let i = index; i < index + wordData.baseForm.length; i++) {
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
          splitSentence[i].savedWords.push(wordData.id);
        }
        index = sentence.indexOf(wordData.surfaceForm, index + 1);
      }
    }
  });

  // POST-PROCESSING: Chunk adjacent characters with identical savedWords
  const chunked: Array<{
    text: string;
    savedWords: string[];
    startIndex: number;
    endIndex: number;
  }> = [];

  let currentChunk = {
    text: splitSentence[0].text,
    savedWords: splitSentence[0].savedWords,
    startIndex: 0,
    endIndex: 0,
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
      currentChunk.endIndex = i;
    } else {
      // Save current chunk and start new one
      chunked.push(currentChunk);
      currentChunk = {
        text: current.text,
        savedWords: current.savedWords,
        startIndex: i,
        endIndex: i,
      };
    }
  }

  // Don't forget the last chunk
  chunked.push(currentChunk);

  return chunked;
};
