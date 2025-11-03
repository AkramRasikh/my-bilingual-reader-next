import { stringEndsWithNumber } from '@/utils/string-ends-with-number';
import { getGeneralTopicName } from '@/utils/get-general-topic-name';

export const formatContentData = (targetLanguageLoadedContent) =>
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
