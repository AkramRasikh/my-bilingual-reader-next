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
import { updateContentMetaDataAPI } from '../client-api/update-content-meta-data';
import { updateAdhocSentenceAPI } from '../client-api/update-adhoc-sentence';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import saveWordAPI from '../client-api/save-word';
import { deleteWordAPI } from '../client-api/delete-word';
import { updateSentenceDataAPI } from '../client-api/update-sentence-api';
import { getAudioURL } from '@/utils/get-media-url';

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
  const [toastMessageState, setToastMessageState] = useState('');
  const [story, setStory] = useState();

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

  const updateContentMetaData = async ({
    topicName,
    fieldToUpdate,
    contentIndex,
  }) => {
    try {
      const resObj = await updateContentMetaDataAPI({
        title: topicName,
        fieldToUpdate,
        language: languageSelectedState,
      });

      if (resObj) {
        dispatchContent({
          type: 'updateMetaData',
          contentIndex,
          fieldToUpdate: resObj,
        });
      }
    } catch (error) {
      console.log('## updateContentMetaData', error);
      setToastMessageState('Error deleting word ❌');
    }
  };

  const updateAdhocSentenceData = async ({
    sentenceId,
    fieldToUpdate,
    isRemoveReview,
  }) => {
    try {
      const updatedFieldFromDB = await updateAdhocSentenceAPI({
        sentenceId,
        fieldToUpdate,
        language: languageSelectedState,
      });

      if (updatedFieldFromDB) {
        dispatchSentences({
          type: 'updateSentence',
          sentenceId,
          isRemoveReview,
          updatedFieldFromDB,
          isDueCheck,
        });

        setToastMessageState(
          isRemoveReview
            ? 'Successful learned sentence ✅'
            : 'Sentence reviewed ✅',
        );
      }
    } catch (error) {
      console.log('## updateAdhocSentenceData', { error });
      // updatePromptFunc(`Error updating sentence for ${topicName}`);
    } finally {
      // setUpdatingSentenceState('');
    }
  };
  const handleDeleteWordDataProvider = async ({ wordId }) => {
    try {
      await deleteWordAPI({ wordId, language: languageSelectedState });
      dispatchWords({ type: 'removeWord', wordId });

      return true;
    } catch (error) {
      console.log('## handleDeleteWordDataProvider deleteWord', { error });
    }
  };

  const updateSentenceData = async ({
    topicName,
    sentenceId,
    fieldToUpdate,
    contentIndex,
    isRemoveReview,
  }) => {
    try {
      const updatedFieldFromDB = await updateSentenceDataAPI({
        topicName,
        sentenceId,
        fieldToUpdate,
        language: languageSelectedState,
      });

      if (isRemoveReview) {
        dispatchContent({
          type: 'removeReview',
          contentIndex,
          sentenceId,
        });
      } else {
        const { reviewData } = updatedFieldFromDB;
        dispatchContent({
          type: 'updateSentence',
          contentIndex,
          sentenceId,
          fields: { reviewData },
        });
      }

      return updatedFieldFromDB?.reviewData;
    } catch (error) {
      console.log('## updateSentenceData', { error });
    }
  };

  // check between this and handleDelete
  const updateWordDataProvider = async ({
    wordId,
    fieldToUpdate,
    isRemoveReview,
  }) => {
    try {
      if (isRemoveReview) {
        const res = await fetch('/api/deleteWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, language: languageSelectedState }),
        });
        const data = await res.json();

        dispatchWords({ type: 'removeWord', wordId: data.id });
        setToastMessageState('Successful learned word ✅');
        return true;
      } else {
        const res = await fetch('/api/updateWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: wordId,
            fieldToUpdate,
            language: languageSelectedState,
          }),
        });

        const data = await res.json();
        dispatchWords({
          type: 'updateWord',
          wordId,
          data,
        });
        setToastMessageState('Word reviewed ✅');
        return true;
      }
    } catch (error) {
      console.log('## updateWordDataProvider DataProvider', { error });
      setToastMessageState('Error reviewing word ❌');
    }
  };

  const handleSaveWord = async ({
    highlightedWord,
    highlightedWordSentenceId,
    contextSentence,
    meaning,
    isGoogle,
  }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.vocab,
    });

    const savedWord = await saveWordAPI({
      highlightedWord,
      highlightedWordSentenceId,
      contextSentence,
      reviewData: nextScheduledOptions['1'].card,
      meaning,
      isGoogle,
      language: languageSelectedState,
    });

    if (savedWord) {
      dispatchWords({
        type: 'addWord',
        word: savedWord, // can be one or multiple
      });
      return savedWord;
    }
  };

  const addImageDataProvider = async ({ wordId, formData }) => {
    try {
      formData.append('language', languageSelectedState);
      const res = await fetch('/api/addWordImage', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data) {
        dispatchWords({
          type: 'updateWordData',
          wordId,
          fields: { imageUrl: data.imageUrl },
        });
      }
    } catch (error) {
      console.log('## addImageDataProvider DataProvider', { error });
    }
  };

  const addGeneratedSentence = async ({ targetLang, baseLang, notes }) => {
    console.log('## addGeneratedSentence', targetLang, baseLang);
    const res = await fetch('/api/addSentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: languageSelectedState,
        targetLang,
        baseLang,
        localAudioPath: story.audioUrl,
        notes,
      }),
    });
    const data = await res.json();

    console.log('## addGeneratedSentence data', data);

    if (data) {
      setStory({
        ...story,
        isSaved: true,
        audioUrl: getAudioURL(data[0].id, languageSelectedState),
      });
    }

    dispatchSentences({ type: 'addSentence', sentence: data });
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
        updateContentMetaData,
        toastMessageState,
        setToastMessageState,
        story,
        setStory,
        updateAdhocSentenceData,
        handleSaveWord,
        handleDeleteWordDataProvider,
        updateWordDataProvider,
        updateSentenceData,
        addGeneratedSentence,
        addImageDataProvider,
        wordsToReviewOnMountState,
      }}
    >
      {children}
    </FetchDataContext.Provider>
  );
}

export function useFetchData() {
  return useContext(FetchDataContext);
}
