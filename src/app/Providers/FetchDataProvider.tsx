'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
} from 'react';
import { content, sentences, words } from '../client-api/get-on-load-data';
import useLanguageSelector from './useLanguageSelector';
import { sentencesReducer } from '../reducers/sentences-reducer';
import { contentReducer } from '../reducers/content-reducer';
import { wordsReducer } from '../reducers/words-reducer';
import useDataSaveToLocalStorage from './useDataSaveToLocalStorage';

const FetchDataContext = createContext(null);

export function FetchDataProvider({ children }) {
  const [languageSelectedState, setLanguageSelectedState] = useState('');
  const [languageOnMountState, setLanguageOnMountState] = useState('');
  const [hasFetchedDataState, setHasFetchedDataState] = useState(false);
  const [sentencesState, dispatchSentences] = useReducer(sentencesReducer, []);
  const [contentState, dispatchContent] = useReducer(contentReducer, []);
  const [wordsState, dispatchWords] = useReducer(wordsReducer, []);

  useLanguageSelector({
    languageSelectedState,
    setLanguageOnMountState,
    languageOnMountState,
    setLanguageSelectedState,
  });

  useDataSaveToLocalStorage({
    languageSelectedState,
    wordsState,
    sentencesState,
    contentState,
    hasFetchedDataState,
  });

  useEffect(() => {
    if (!hasFetchedDataState && languageSelectedState) {
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

      const contentStateExist = contentState?.length >= 0;

      if (contentStateExist) {
        console.log('## Fetching from localStorage');
        setHasFetchedDataState(true);
        dispatchWords({
          type: 'initWords',
          words: wordsState,
        });
        dispatchContent({
          type: 'initContent',
          content: contentState,
        });
        dispatchSentences({
          type: 'initSentences',
          sentences: sentencesState,
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
          .then((data) => {
            dispatchWords({
              type: 'initWords',
              words: data?.wordsData,
            });
            dispatchContent({
              type: 'initContent',
              content: data.contentData,
            });
            dispatchSentences({
              type: 'initSentences',
              sentences: data?.sentencesData,
            });
            setHasFetchedDataState(true);
          })
          .catch(console.error);
      }
    }
  }, [hasFetchedDataState, languageSelectedState]);

  return (
    <FetchDataContext.Provider
      value={{
        languageSelectedState,
        setLanguageSelectedState,
        dispatchSentences,
        dispatchContent,
        dispatchWords,
        sentencesState,
        contentState,
        wordsState,
        hasFetchedDataState,
      }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
