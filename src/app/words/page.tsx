import { getOnLoadData } from '@/app/get-on-load-data';
import PageContainer from '../PageContainer';
import WordsContainer from './WordsContainer';

export default async function WordsRoute() {
  const allStudyDataRes = await getOnLoadData();

  const targetLanguageLoadedSentences = allStudyDataRes.sentences;
  // const targetLanguageLoadedContent = allStudyDataRes.content;
  const targetLanguageLoadedWords = allStudyDataRes.words;
  // // const targetLanguageLoadedSnippets = allStudyDataRes.snippets;
  // // const targetLanguageLoadedSnippetsWithSavedTag =
  // //   targetLanguageLoadedSnippets?.map((item) => ({
  // //     ...item,
  // //     saved: true,
  // //   }));

  // const sortedContent = targetLanguageLoadedContent
  //   ?.sort((a, b) => {
  //     return a.isCore === b.isCore ? 0 : a.isCore ? -1 : 1;
  //   })
  //   .map((contentWidget, contentIndex) => ({
  //     ...contentWidget,
  //     contentIndex: contentIndex,
  //     isFirst:
  //       contentWidget.title.endsWith('-1') ||
  //       contentWidget.title.endsWith('-01'),
  //     generalTopicName: getGeneralTopicName(contentWidget.title),
  //   }));

  const dateNow = new Date();
  const matchedWordsForCards = [];

  const isDueCheck = (sentence, todayDateObj) => {
    return (
      (sentence?.nextReview && sentence.nextReview < todayDateObj) ||
      new Date(sentence?.reviewData?.due) < todayDateObj
    );
  };

  const getAdditionalContextData = (arr) => {
    if (arr?.length === 0) {
      return null;
    }

    const thisWordsCorrespondingSentenceHelpers = [];

    for (const obj of targetLanguageLoadedSentences) {
      if (arr.includes(obj.id)) {
        thisWordsCorrespondingSentenceHelpers.push(obj);
        if (thisWordsCorrespondingSentenceHelpers.length === arr.length) {
          break; // All matches found early
        }
      }
    }

    return thisWordsCorrespondingSentenceHelpers;
  };

  // need to map first sentence with topic
  targetLanguageLoadedWords.forEach((item) => {
    if (isDueCheck(item, dateNow) || !item?.reviewData) {
      const firstContext = item.contexts[0];

      const thisWordsSentenceData = targetLanguageLoadedSentences.find(
        (i) => i.id === firstContext,
      );
      if (
        thisWordsSentenceData &&
        thisWordsSentenceData?.topic &&
        thisWordsSentenceData?.generalTopic
      ) {
        const formattedContext = {
          ...thisWordsSentenceData,
          title: thisWordsSentenceData?.generalTopic,
          fullTitle: thisWordsSentenceData.topic,
        };

        const contextData =
          item.contexts.length > 1
            ? [
                formattedContext,
                ...getAdditionalContextData(item.contexts.slice(1)),
              ]
            : [formattedContext];
        matchedWordsForCards.push({
          ...item,
          topic: thisWordsSentenceData.topic,
          generalTopic: thisWordsSentenceData.generalTopic,
          isWord: true,
          contextData,
        });
      } else {
        const formattedContext = {
          ...thisWordsSentenceData,
          title: 'sentence-helper',
          fullTitle: 'sentence-helper',
        };
        const contextData =
          item.contexts.length > 1
            ? [formattedContext, ...getAdditionalContextData(item.contexts)]
            : [formattedContext];
        matchedWordsForCards.push({
          ...item,
          topic: 'sentence-helper',
          generalTopic: 'sentence-helper',
          isWord: true,
          contextData,
        });
      }
    }
  });

  const words = matchedWordsForCards.map((item) => {
    return {
      ...item,
      isDue: isDueCheck(item, dateNow),
    };
  });

  const dueWords = words.filter((item) => item.isDue);

  console.log('## ', {
    words: words[0],
    isDueWords: words.filter((item) => item.isDue)[0],
  });

  return (
    <PageContainer>
      <h1 className='text-center p-1'>Yah Dun Kno Words!</h1>

      <WordsContainer words={dueWords} />
    </PageContainer>
  );
}
