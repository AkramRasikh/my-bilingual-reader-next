'use client';
import { createContext, useState } from 'react';

export const WordsContext = createContext(null);

export const WordsProvider = ({
  words,
  children,
}: PropsWithChildren<object>) => {
  const [wordsState, setWordsState] = useState(words);
  const [wordBasketState, setWordBasketState] = useState([]);

  const addWordToBasket = (word) => {
    const wordIsInBasic = wordBasketState.some(
      (wordItem) => wordItem?.id === word.id,
    );

    if (wordIsInBasic) {
      const updatedBasket = wordBasketState.filter(
        (item) => item.id !== word.id,
      );
      setWordBasketState(updatedBasket);
      return;
    }

    setWordBasketState((prev) => [...prev, word]);
  };

  const updateWordData = async ({
    wordId,
    fieldToUpdate,
    language,
    isRemoveReview,
  }) => {
    try {
      if (isRemoveReview) {
        const res = await fetch('/api/deleteWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, language }),
        });
        const data = await res.json();
        console.log('## data', data);

        const targetLanguageWordsStateUpdated = words.filter(
          (item) => item.id !== wordId,
        );
        setWordsState(targetLanguageWordsStateUpdated);

        return true;
      } else {
        const res = await fetch('/api/updateWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, fieldToUpdate, language }),
        });

        const data = await res.json();
        console.log('## data', data);

        const targetLanguageWordsStateUpdated = words.map((item) => {
          const thisWordId = item.id === wordId;
          if (thisWordId) {
            return {
              ...item,
              ...data,
            };
          }
          return item;
        });
        setWordsState(targetLanguageWordsStateUpdated);

        return true;
      }
    } catch (error) {
      console.log('## updateWordData DataProvider', { error });
    }
  };

  return (
    <WordsContext.Provider
      value={{
        wordsState,
        wordBasketState,
        setWordBasketState,
        addWordToBasket,
        updateWordData,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
};
