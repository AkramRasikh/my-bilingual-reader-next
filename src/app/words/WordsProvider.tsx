'use client';
import { createContext, useState } from 'react';

export const WordsContext = createContext(null);

export const WordsProvider = ({
  words,
  children,
}: PropsWithChildren<object>) => {
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
  return (
    <WordsContext.Provider
      value={{ wordBasketState, setWordBasketState, addWordToBasket }}
    >
      {children}
    </WordsContext.Provider>
  );
};
