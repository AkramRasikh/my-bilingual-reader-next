import { useEffect } from 'react';
import { FetchDataContextTypes } from './FetchDataProvider';
import { isE2EMode } from '@/utils/is-e2e-mode';

const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

interface UseDataSaveToLocalStorageTypes {
  languageSelectedState: FetchDataContextTypes['languageSelectedState'];
  wordsState: FetchDataContextTypes['wordsState'];
  sentencesState: FetchDataContextTypes['sentencesState'];
  contentState: FetchDataContextTypes['contentState'];
  hasFetchedDataState: FetchDataContextTypes['hasFetchedDataState'];
}

const useDataSaveToLocalStorage = ({
  languageSelectedState,
  wordsState,
  sentencesState,
  contentState,
  hasFetchedDataState,
}: UseDataSaveToLocalStorageTypes) => {
  useEffect(() => {
    if (!hasFetchedDataState || isE2EMode()) {
      return;
    }

    if (!isMockEnv) {
      console.log('## Triggering save (words)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-wordsState`,
        JSON.stringify(wordsState),
      );
    }
  }, [wordsState, hasFetchedDataState]);

  useEffect(() => {
    if (!hasFetchedDataState || isE2EMode()) {
      return;
    }

    if (!isMockEnv) {
      console.log('## Triggering save (sentences)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-sentencesState`,
        JSON.stringify(sentencesState),
      );
    }
  }, [sentencesState, hasFetchedDataState]);

  useEffect(() => {
    if (!hasFetchedDataState || isE2EMode()) {
      return;
    }

    if (!isMockEnv) {
      console.log('## Triggering save (content)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-contentState`,
        JSON.stringify(contentState),
      );
    }
  }, [contentState, hasFetchedDataState]);
};

export default useDataSaveToLocalStorage;
