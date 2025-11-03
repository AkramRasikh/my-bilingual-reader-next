import { useEffect } from 'react';
import { content, sentences, words } from '../client-api/get-on-load-data';

const useFetchInitData = ({
  hasFetchedDataState,
  languageSelectedState,
  setHasFetchedDataState,
  dispatchWords,
  dispatchContent,
  dispatchSentences,
  setToastMessageState,
}) => {
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
