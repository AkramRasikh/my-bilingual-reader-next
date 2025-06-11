import { DataProvider } from './DataProvider';
import { getGeneralTopicName } from './get-general-topic-name';
import { getOnLoadData } from './get-on-load-data';
import { HomeContainer } from './HomeContainer';

export default async function Home() {
  const allStudyDataRes = await getOnLoadData();

  const targetLanguageLoadedSentences = allStudyDataRes.sentences;
  const targetLanguageLoadedContent = allStudyDataRes.content;
  const targetLanguageLoadedWords = allStudyDataRes.words;
  // const targetLanguageLoadedSnippets = allStudyDataRes.snippets;
  // const targetLanguageLoadedSnippetsWithSavedTag =
  //   targetLanguageLoadedSnippets?.map((item) => ({
  //     ...item,
  //     saved: true,
  //   }));

  const sortedContent = targetLanguageLoadedContent
    ?.sort((a, b) => {
      return a.isCore === b.isCore ? 0 : a.isCore ? -1 : 1;
    })
    .map((contentWidget, contentIndex) => ({
      ...contentWidget,
      contentIndex: contentIndex,
      isFirst:
        contentWidget.title.endsWith('-1') ||
        contentWidget.title.endsWith('-01'),
      generalTopicName: getGeneralTopicName(contentWidget.title),
    }));

  return (
    <DataProvider
      targetLanguageLoadedWords={targetLanguageLoadedWords}
      targetLanguageLoadedSentences={targetLanguageLoadedSentences}
      sortedContent={sortedContent}
    >
      <HomeContainer sortedContent={sortedContent} />
    </DataProvider>
  );
}
