'use client';
import { createContext, useEffect, useState } from 'react';

export const WordsContext = createContext(null);

export const WordsProvider = ({
  words,
  children,
}: PropsWithChildren<object>) => {
  const [wordsState, setWordsState] = useState([]);
  const [wordBasketState, setWordBasketState] = useState([]);

  useEffect(() => {
    setWordsState(words);
  }, []);

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

        const targetLanguageWordsStateUpdated = wordsState.filter(
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

        const targetLanguageWordsStateUpdated = wordsState.map((item) => {
          const thisWordId = item.id === wordId;
          if (thisWordId) {
            const isDue = data.reviewData?.due < new Date();
            return {
              ...item,
              ...data,
              isDue,
            };
          }
          return item;
        });

        setWordsState(targetLanguageWordsStateUpdated.filter((i) => i?.isDue));
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
