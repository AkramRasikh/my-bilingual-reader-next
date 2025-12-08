import { getGeneralTopicName } from '@/utils/get-general-topic-name';
import { stringEndsWithNumber } from '@/utils/string-ends-with-number';

export const content = 'content';
export const words = 'words';
export const adhocSentences = 'adhocSentences';
export const sentences = 'sentences';

const addContentIndexAndGeneralTopicName = (targetLanguageLoadedContent) =>
  targetLanguageLoadedContent.map((contentWidget, contentIndex) => {
    const generalTopicName = !stringEndsWithNumber(contentWidget.title)
      ? contentWidget.title
      : getGeneralTopicName(contentWidget.title);

    return {
      ...contentWidget,
      contentIndex,
      generalTopicName,
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
