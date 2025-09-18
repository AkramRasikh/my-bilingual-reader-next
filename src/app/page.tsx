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
    (contentWidget, contentIndex) => ({
      ...contentWidget,
      contentIndex: contentIndex,
      isFirst:
        contentWidget.title.endsWith('-1') ||
        contentWidget.title.endsWith('-01'),
      generalTopicName: getGeneralTopicName(contentWidget.title),
    }),
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
