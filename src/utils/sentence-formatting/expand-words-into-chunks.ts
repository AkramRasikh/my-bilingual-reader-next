export const expandWordsIntoChunks = (words) => {
  let globalIdx = 0;

  return words.flatMap((word) => {
    const underlined = word.isSaved;

    return word.text.split('').map((char) => {
      const chunk = {
        text: char,
        underlined,
        index: globalIdx,
      };

      // Only if this word has underline, attach its full text
      if (underlined) {
        chunk.originalText = word.text;
      }

      globalIdx++;
      return chunk;
    });
  });
};
