import { Dispatch, SetStateAction, useEffect } from 'react';
import { FetchDataContextTypes } from './FetchDataProvider';

export const content = 'content';
export const words = 'words';
export const sentences = 'sentences';

const isE2EMode = () => {
  return typeof window !== 'undefined' && window.localStorage.getItem('e2e-testing') === 'true';
};

const getLocalStorageData = (language: string) => {
  if (isE2EMode()) {
    return { wordsState: null, sentencesState: null, contentState: null };
  }

  return {
    wordsState: JSON.parse(localStorage.getItem(`${language}-wordsState`) as string),
    sentencesState: JSON.parse(localStorage.getItem(`${language}-sentencesState`) as string),
    contentState: JSON.parse(localStorage.getItem(`${language}-contentState`) as string),
  };
};

interface UseFetchInitDataTypes {
  hasFetchedDataState: FetchDataContextTypes['hasFetchedDataState'];
  languageSelectedState: FetchDataContextTypes['languageSelectedState'];
  setHasFetchedDataState: Dispatch<SetStateAction<boolean>>;
  dispatchWords: FetchDataContextTypes['dispatchWords'];
  dispatchContent: FetchDataContextTypes['dispatchContent'];
  dispatchSentences: FetchDataContextTypes['dispatchSentences'];
  setToastMessageState: FetchDataContextTypes['setToastMessageState'];
}

const useFetchInitData = ({
  hasFetchedDataState,
  languageSelectedState,
  setHasFetchedDataState,
  dispatchWords,
  dispatchContent,
  dispatchSentences,
  setToastMessageState,
}: UseFetchInitDataTypes) => {
  useEffect(() => {
    if (!hasFetchedDataState && languageSelectedState) {
      const { wordsState, sentencesState, contentState } = getLocalStorageData(languageSelectedState);
      const contentStateExist = contentState?.length >= 0;

      if (contentStateExist) {
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
        setToastMessageState('Loaded data from LocalStorage ✅💰');
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
            setToastMessageState('Loaded data from DB ✅');
          })
          .catch(console.error);
      }
    }
  }, [hasFetchedDataState, languageSelectedState]);
};

export default useFetchInitData;
