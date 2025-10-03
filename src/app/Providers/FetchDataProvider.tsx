'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { content, sentences, words } from '../client-api/get-on-load-data';

const FetchDataContext = createContext(null);

export function FetchDataProvider({ children }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!data) {
      //
      const wordsState = JSON.parse(
        localStorage.getItem('wordsState') as string,
      );
      const sentencesState = JSON.parse(
        localStorage.getItem('sentencesState') as string,
      );
      const contentState = JSON.parse(
        localStorage.getItem('contentState') as string,
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
          body: JSON.stringify([content, words, sentences]),
        }) // your endpoint
          .then((res) => res.json())
          .then(setData)
          .catch(console.error);
      }
    }
  }, [data]);

  return (
    <FetchDataContext.Provider value={{ data, setData }}>
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
