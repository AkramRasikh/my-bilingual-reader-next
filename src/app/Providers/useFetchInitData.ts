import { Dispatch, SetStateAction, useEffect } from 'react';
import { FetchDataContextTypes } from './FetchDataProvider';
import { isE2EMode } from '@/utils/is-e2e-mode';
import { apiRequestWrapper } from '@/lib/api-request-wrapper';

export const content = 'content';
export const words = 'words';
export const sentences = 'sentences';

interface OnLoadDataResponse {
  wordsData: FetchDataContextTypes['wordsState'];
  contentData: FetchDataContextTypes['contentState'];
  sentencesData: FetchDataContextTypes['sentencesState'];
}

const getLocalStorageData = (language: string) => {
  if (isE2EMode()) {
    return { wordsState: null, sentencesState: null, contentState: null };
  }

  return {
    wordsState: JSON.parse(
      localStorage.getItem(`${language}-wordsState`) as string,
    ),
    sentencesState: JSON.parse(
      localStorage.getItem(`${language}-sentencesState`) as string,
    ),
    contentState: JSON.parse(
      localStorage.getItem(`${language}-contentState`) as string,
    ),
  };
};

interface UseFetchInitDataTypes {
  hasFetchedDataState: FetchDataContextTypes['hasFetchedDataState'];
  languageSelectedState: FetchDataContextTypes['languageSelectedState'];
  setHasFetchedDataState: Dispatch<SetStateAction<boolean>>;
  setHasFetchInitErrorState: Dispatch<SetStateAction<boolean>>;
  dispatchWords: FetchDataContextTypes['dispatchWords'];
  dispatchContent: FetchDataContextTypes['dispatchContent'];
  dispatchSentences: FetchDataContextTypes['dispatchSentences'];
  setToastMessageState: FetchDataContextTypes['setToastMessageState'];
}

const useFetchInitData = ({
  hasFetchedDataState,
  languageSelectedState,
  setHasFetchedDataState,
  setHasFetchInitErrorState,
  dispatchWords,
  dispatchContent,
  dispatchSentences,
  setToastMessageState,
}: UseFetchInitDataTypes) => {
  useEffect(() => {
    if (!hasFetchedDataState && languageSelectedState) {
      setHasFetchInitErrorState(false);
      const { wordsState, sentencesState, contentState } = getLocalStorageData(
        languageSelectedState,
      );
      const contentStateExist = contentState?.length >= 0;

      if (contentStateExist) {
        setHasFetchedDataState(true);
        dispatchWords({
          type: 'initWords',
          words: wordsState,
          content: contentState,
          // sentences: sentencesState,
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
        apiRequestWrapper({
          url: '/api/getOnLoadData',
          body: {
            refs: [content, words, sentences],
            language: languageSelectedState,
          },
        })
          .then((data) => {
            const typedData = data as OnLoadDataResponse;
            dispatchWords({
              type: 'initWords',
              words: typedData.wordsData,
              content: typedData.contentData,
            });
            dispatchContent({
              type: 'initContent',
              content: typedData.contentData,
            });
            dispatchSentences({
              type: 'initSentences',
              sentences: typedData.sentencesData,
            });
            setHasFetchedDataState(true);
            setHasFetchInitErrorState(false);
            setToastMessageState('Loaded data from DB ✅');
          })
          .catch((error) => {
            console.error(error);
            setHasFetchInitErrorState(true);
          });
      }
    }
  }, [
    dispatchContent,
    dispatchSentences,
    dispatchWords,
    hasFetchedDataState,
    languageSelectedState,
    setHasFetchInitErrorState,
    setHasFetchedDataState,
    setToastMessageState,
  ]);
};

export default useFetchInitData;
