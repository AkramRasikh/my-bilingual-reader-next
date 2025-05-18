import { getOnLoadData } from './get-on-load-data';

import { HomeContainer } from './HomeContainer';
import { makeArrayUnique } from './useHighlightWordToWordBank';

export default async function Home() {
  const allStudyDataRes = await getOnLoadData();

  const targetLanguageLoadedSentences = allStudyDataRes.sentences;
  const targetLanguageLoadedContent = allStudyDataRes.content;
  const targetLanguageLoadedSnippets = allStudyDataRes.snippets;
  const targetLanguageLoadedWords = allStudyDataRes.words;
  const targetLanguageLoadedSnippetsWithSavedTag =
    targetLanguageLoadedSnippets?.map((item) => ({
      ...item,
      saved: true,
    }));

  const sortedContent = targetLanguageLoadedContent
    ?.sort((a, b) => {
      return a.isCore === b.isCore ? 0 : a.isCore ? -1 : 1;
    })
    .map((contentWidget, contentIndex) => ({
      ...contentWidget,
      contentIndex: contentIndex,
    }));

  const wordsFromSentences = [];
  let pureWords = [];

  const getPureWords = () => {
    targetLanguageLoadedWords?.forEach((wordData) => {
      if (wordData?.baseForm) {
        pureWords.push(wordData.baseForm);
      }
      if (wordData?.surfaceForm) {
        pureWords.push(wordData.surfaceForm);
      }
    });

    targetLanguageLoadedSentences?.forEach((sentence) => {
      if (sentence?.matchedWordsSurface) {
        sentence?.matchedWordsSurface.forEach((item, index) => {
          if (item && !pureWords.includes(item)) {
            pureWords.push(item);
            wordsFromSentences.push({
              wordId: sentence?.matchedWordsId[index],
              word: item,
            });
          }
        });
      }
    });
    const pureWordsUnique =
      pureWords?.length > 0 ? makeArrayUnique(pureWords) : [];
    return pureWordsUnique;
  };

  getPureWords();

  console.log('## pureWords', pureWords[0]);

  return (
    <HomeContainer
      targetLanguageLoadedSentences={targetLanguageLoadedSentences}
      targetLanguageLoadedWords={targetLanguageLoadedWords}
      targetLanguageLoadedSnippetsWithSavedTag={
        targetLanguageLoadedSnippetsWithSavedTag
      }
      sortedContent={sortedContent}
      pureWords={pureWords}
    />
  );
}
