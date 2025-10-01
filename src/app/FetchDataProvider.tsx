'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { content, sentences, words } from './get-on-load-data';

const FetchDataContext = createContext(null);

export function FetchDataProvider({ children, initialData }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!data) {
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
