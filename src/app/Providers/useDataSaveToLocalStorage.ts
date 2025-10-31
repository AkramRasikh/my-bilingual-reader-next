import { useEffect } from 'react';

const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

const useDataSaveToLocalStorage = ({
  languageSelectedState,
  wordsState,
  sentencesState,
  contentState,
  hasFetchedDataState,
}) => {
  useEffect(() => {
    if (!hasFetchedDataState) {
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
    if (!hasFetchedDataState) {
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
    if (!hasFetchedDataState) {
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
