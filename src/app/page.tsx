import { DataProvider } from './DataProvider';
import { getGeneralTopicName } from './get-general-topic-name';
import { getOnLoadData } from './get-on-load-data';
import PageBaseContent from './PageBaseContent';

export default async function Home() {
  const allStudyDataRes = await getOnLoadData();

  const targetLanguageLoadedSentences = allStudyDataRes.sentences;
  const targetLanguageLoadedContent = allStudyDataRes.content;
  const targetLanguageLoadedWords = allStudyDataRes.words;

  const sortedContent = targetLanguageLoadedContent?.map(
    (contentWidget, contentIndex) => {
      const generalTopicName = getGeneralTopicName(contentWidget.title);
      const isFirst =
        contentWidget.title.endsWith('-1') ||
        contentWidget.title.endsWith('-01');
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
    },
  );

  return (
    <DataProvider
      targetLanguageLoadedWords={targetLanguageLoadedWords}
      targetLanguageLoadedSentences={targetLanguageLoadedSentences}
      sortedContent={sortedContent}
    >
      <PageBaseContent />
    </DataProvider>
  );
}
