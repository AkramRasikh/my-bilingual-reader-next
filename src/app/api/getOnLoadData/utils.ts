export const content = 'content';
export const words = 'words';
export const sentences = 'sentences';

const addContentIndexAndGeneralTopicName = (targetLanguageLoadedContent) =>
  targetLanguageLoadedContent.map((contentWidget, contentIndex) => {
    return {
      ...contentWidget,
      contentIndex,
      generalTopicName: contentWidget.title,
    };
  });

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
    contentData: addContentIndexAndGeneralTopicName(
      targetLanguageLoadedContent,
    ),
    wordsData: targetLanguageLoadedWords,
    sentencesData: targetLanguageLoadedSentences,
  };

  return data;
};
