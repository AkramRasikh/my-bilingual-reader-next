'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from 'react';
import { content, sentences, words } from '../client-api/get-on-load-data';
import useLanguageSelector from './useLanguageSelector';
import { sentencesReducer } from '../reducers/sentences-reducer';
import { contentReducer } from '../reducers/content-reducer';
import { wordsReducer } from '../reducers/words-reducer';
import useDataSaveToLocalStorage from './useDataSaveToLocalStorage';
import { makeWordArrayUnique } from '@/utils/make-word-array-unique';
import { isNumber } from '@/utils/is-number';
import { isDueCheck } from '@/utils/is-due-check';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { breakdownSentenceAPI } from '../client-api/breakdown-sentence';
import { sentenceReviewBulkAPI } from '../client-api/bulk-sentence-review';

const FetchDataContext = createContext(null);

export function FetchDataProvider({ children }) {
  const [languageSelectedState, setLanguageSelectedState] = useState('');
  const [languageOnMountState, setLanguageOnMountState] = useState('');
  const [hasFetchedDataState, setHasFetchedDataState] = useState(false);
  const [sentencesState, dispatchSentences] = useReducer(sentencesReducer, []);
  const [contentState, dispatchContent] = useReducer(contentReducer, []);
  const [wordsState, dispatchWords] = useReducer(wordsReducer, []);
  const [wordsToReviewOnMountState, setWordsToReviewOnMountState] =
    useState(null);
  const [wordBasketState, setWordBasketState] = useState([]);

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

  const pureWordsMemoized = useMemo(() => {
    const pureWords = [];
    wordsState?.forEach((wordData) => {
      if (wordData?.baseForm) {
        pureWords.push(wordData.baseForm);
      }
      if (wordData?.surfaceForm) {
        pureWords.push(wordData.surfaceForm);
      }
    });

    sentencesState?.forEach((sentence) => {
      if (sentence?.matchedWordsSurface) {
        sentence?.matchedWordsSurface.forEach((item) => {
          if (item && !pureWords.includes(item)) {
            pureWords.push(item);
          }
        });
      }
    });
    const pureWordsUnique =
      pureWords?.length > 0 ? makeWordArrayUnique(pureWords) : [];
    return pureWordsUnique;
  }, [wordsState]);

  const wordsForReviewMemoized = useMemo(() => {
    const dateNow = new Date();
    const wordsForReview = wordsState.filter((item) => {
      const isLegacyWordWithNoReview = !item?.reviewData;
      if (isLegacyWordWithNoReview || isDueCheck(item, dateNow)) {
        return true;
      }
    });
    return wordsForReview;
  }, [wordsState]);

  useEffect(() => {
    if (!isNumber(wordsToReviewOnMountState)) {
      setWordsToReviewOnMountState(wordsForReviewMemoized.length);
    }
  }, [wordsForReviewMemoized]);

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

  const sentencesDueForReviewMemoized = useMemo(() => {
    if (sentencesState.length === 0) {
      return [];
    }
    const dateNow = new Date();
    const dueCardsNow = sentencesState.filter((sentence) =>
      isDueCheck(sentence, dateNow),
    );

    const formatSentence = dueCardsNow?.map((item) => {
      return {
        ...item,
        targetLangformatted: underlineWordsInSentence(
          item.targetLang,
          pureWordsMemoized,
        ), // should all be moved eventually to new sentence sphere
      };
    });

    return formatSentence;
  }, [sentencesState]);

  const breakdownSentence = async ({
    topicName,
    sentenceId,
    targetLang,
    contentIndex,
  }) => {
    try {
      const resObj = await breakdownSentenceAPI({
        topicName,
        sentenceId,
        targetLang,
        language: languageSelectedState,
      });

      dispatchContent({
        type: 'updateSentence',
        contentIndex,
        sentenceId,
        fields: { ...resObj },
      });
      return true;
    } catch (error) {
      console.log('## breakdownSentence', { error });
    }
  };

  const sentenceReviewBulk = async ({
    fieldToUpdate,
    topicName,
    contentIndex,
    removeReview,
    sentenceIds,
  }) => {
    try {
      const updatedSentenceIds = await sentenceReviewBulkAPI({
        title: topicName,
        fieldToUpdate,
        language: languageSelectedState,
        removeReview,
        sentenceIds,
      });
      if (updatedSentenceIds) {
        dispatchContent({
          type: 'updateSentences',
          contentIndex,
          sentenceIds: updatedSentenceIds,
          fields: { ...fieldToUpdate },
        });
      }
    } catch (error) {
      console.log('## sentenceReviewBulk error', error);
    }
  };

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
        pureWordsMemoized,
        wordsForReviewMemoized,
        sentencesDueForReviewMemoized,
        wordBasketState,
        setWordBasketState,
        breakdownSentence,
        sentenceReviewBulk,
      }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
