'use client';
import { createContext, useState } from 'react';
import saveWordAPI from './save-word';

export const DataContext = createContext(null);

export const DataProvider = ({
  targetLanguageLoadedWords,
  pureWords,
  children,
}: PropsWithChildren<object>) => {
  const [wordsState, setWordsState] = useState(targetLanguageLoadedWords);

  const handleSaveWord = async ({
    highlightedWord,
    highlightedWordSentenceId,
    contextSentence,
    reviewData,
    meaning,
  }) => {
    //     const cardDataRelativeToNow = getEmptyCard();
    // const nextScheduledOptions = getNextScheduledOptions({
    //   card: cardDataRelativeToNow,
    //   contentType: srsRetentionKeyTypes.vocab,
    // });

    const savedWord = await saveWordAPI({
      highlightedWord,
      highlightedWordSentenceId,
      contextSentence,
      reviewData,
      meaning,
    });

    if (savedWord) {
      const newWordsState = [...wordsState, savedWord];
      setWordsState(newWordsState);
    }
  };

  return (
    <DataContext.Provider
      value={{
        targetLanguageLoadedWords,
        pureWords,
        handleSaveWord,
        wordsState,
        setWordsState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
