import { getGeneralTopicName } from '@/utils/get-general-topic-name';
import { stringEndsWithNumber } from '@/utils/string-ends-with-number';

export const content = 'content';
export const words = 'words';
export const adhocSentences = 'adhocSentences';
export const sentences = 'sentences';

const formatContentData = (targetLanguageLoadedContent) =>
  targetLanguageLoadedContent.map((contentWidget, contentIndex) => {
    const generalTopicName = !stringEndsWithNumber(contentWidget.title)
      ? contentWidget.title
      : getGeneralTopicName(contentWidget.title);
    const isFirst =
      contentWidget.title.endsWith('-1') || contentWidget.title.endsWith('-01');
    const isLastInTotalArr =
      targetLanguageLoadedContent.length === contentIndex + 1;
    const hasFollowingVideo = isLastInTotalArr
      ? false
      : generalTopicName ===
        getGeneralTopicName(
          targetLanguageLoadedContent[contentIndex + 1].title,
        );

    return {
      ...contentWidget,
      contentIndex: contentIndex,
      isFirst,
      hasFollowingVideo,
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
    contentData: formatContentData(targetLanguageLoadedContent),
    wordsData: targetLanguageLoadedWords,
    sentencesData: targetLanguageLoadedSentences,
  };

  return data;
};
