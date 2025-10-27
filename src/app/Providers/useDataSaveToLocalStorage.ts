import { useEffect } from 'react';

const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

const useDataSaveToLocalStorage = ({
  languageSelectedState,
  wordsState,
  sentencesState,
  contentState,
}) => {
  useEffect(() => {
    if (!isMockEnv) {
      console.log('## Triggering save (words)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-wordsState`,
        JSON.stringify(wordsState),
      );
    }
  }, [wordsState]);

  useEffect(() => {
    if (!isMockEnv) {
      console.log('## Triggering save (sentences)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-sentencesState`,
        JSON.stringify(sentencesState),
      );
    }
  }, [sentencesState]);

  useEffect(() => {
    if (!isMockEnv) {
      console.log('## Triggering save (content)', languageSelectedState);
      localStorage.setItem(
        `${languageSelectedState}-contentState`,
        JSON.stringify(contentState),
      );
    }
  }, [contentState]);
};

export default useDataSaveToLocalStorage;
