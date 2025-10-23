'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { content, sentences, words } from '../client-api/get-on-load-data';
import { japanese } from '../languages';

const FetchDataContext = createContext(null);

export function FetchDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [languageSelectedState, setLanguageSelectedState] = useState('');

  useEffect(() => {
    if (languageSelectedState) {
      localStorage.setItem('selectedLanguage', languageSelectedState);
    }
  }, [languageSelectedState]);

  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    setLanguageSelectedState(selectedLanguage || japanese);
  }, []);

  useEffect(() => {
    if (!data && languageSelectedState) {
      const wordsState = JSON.parse(
        localStorage.getItem(`${languageSelectedState}-wordsState`) as string,
      );
      const sentencesState = JSON.parse(
        localStorage.getItem(
          `${languageSelectedState}-sentencesState`,
        ) as string,
      );
      const contentState = JSON.parse(
        localStorage.getItem(`${languageSelectedState}-contentState`) as string,
      );

      const wordsExist = wordsState?.length >= 0;
      const sentencesExist = sentencesState?.length >= 0;
      const contentStateExist = contentState?.length >= 0;

      if (wordsExist && sentencesExist && contentStateExist) {
        console.log('## Fetching from localStorage');
        setData({
          wordsData: wordsState,
          sentencesData: sentencesState,
          contentData: contentState,
        });
      } else {
        fetch('/api/getOnLoadData', {
          //not fully sure how i will need this
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refs: [content, words, sentences],
            language: languageSelectedState,
          }),
        }) // your endpoint
          .then((res) => res.json())
          .then(setData)
          .catch(console.error);
      }
    }
  }, [data, languageSelectedState]);

  return (
    <FetchDataContext.Provider
      value={{ data, setData, languageSelectedState, setLanguageSelectedState }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
