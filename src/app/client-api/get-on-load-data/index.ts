import { formatContentData } from './format-content-data';

export const content = 'content';
export const words = 'words';
export const snippets = 'snippets';
export const adhocSentences = 'adhocSentences';
export const sentences = 'sentences';

export const getFormattedData = (loadedData) => {
  const getNestedObjectData = (thisRef) => {
    return loadedData.find((el) => {
      const dataKeys = Object.keys(el);
      if (dataKeys.includes(thisRef)) {
        return el;
      }
    });
  };

  const targetLanguageLoadedContent = getNestedObjectData(
    content,
  ).content.filter((item) => item !== null);

  const targetLanguageLoadedWords = getNestedObjectData(words)?.words || [];
  const targetLanguageLoadedSentences =
    getNestedObjectData(sentences)?.sentences || [];

  const data = {
    contentData: formatContentData(targetLanguageLoadedContent),
    wordsData: targetLanguageLoadedWords,
    sentencesData: targetLanguageLoadedSentences,
  };

  return data;
};
