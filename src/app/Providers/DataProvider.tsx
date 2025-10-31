'use client';
import { createContext, useEffect, useMemo, useState } from 'react';
import saveWordAPI from '../client-api/save-word';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import { deleteWordAPI } from '../client-api/delete-word';
import { updateSentenceDataAPI } from '../client-api/update-sentence-api';
import { breakdownSentenceAPI } from '../client-api/breakdown-sentence';
import { updateContentMetaDataAPI } from '../client-api/update-content-meta-data';
import { updateAdhocSentenceAPI } from '../client-api/update-adhoc-sentence';
import { getAudioURL } from '../../utils/get-media-url';
import { sentenceReviewBulkAPI } from '../client-api/bulk-sentence-review';
import { isDueCheck } from '@/utils/is-due-check';
import { makeWordArrayUnique } from '@/utils/make-word-array-unique';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { isNumber } from '@/utils/is-number';
import { useFetchData } from './FetchDataProvider';

export const DataContext = createContext(null);

export const DataProvider = ({ children }: PropsWithChildren<object>) => {
  const [story, setStory] = useState();
  const [mountedState, setMountedState] = useState(false);
  const [wordBasketState, setWordBasketState] = useState([]);
  const [toastMessageState, setToastMessageState] = useState('');
  const [wordsToReviewOnMountState, setWordsToReviewOnMountState] =
    useState(null);

  const {
    dispatchSentences,
    dispatchContent,
    dispatchWords,
    sentencesState,
    contentState,
    wordsState,
    languageSelectedState,
  } = useFetchData();

  const generalTopicDisplayNameMemoized = useMemo(() => {
    const generalNamesArr = [];

    for (const contentItem of contentState) {
      const itemGenName = contentItem.generalTopicName;
      const isMedia = contentItem?.origin === 'youtube';
      if (
        isMedia &&
        !generalNamesArr.some((item) => item.title === itemGenName)
      ) {
        const youtubeId = contentItem?.url?.split('=')[1];
        generalNamesArr.push({
          title: itemGenName,
          youtubeId,
        });
      }
    }
    return generalNamesArr;
  }, [contentState]);

  const getPureWords = () => {
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
  };

  const pureWordsMemoized = useMemo(
    () => getPureWords(),
    [getPureWords, wordsState],
  );
  useEffect(() => {
    if (
      sentencesState.length === 0 &&
      pureWordsMemoized.length > 0 &&
      !mountedState
    ) {
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

      setMountedState(true);
      // dispatchSentences({ type: 'initSentences', sentences: formatSentence });
    }
  }, [sentencesState, mountedState, pureWordsMemoized]);

  const wordsForReviewMemoized = useMemo(() => {
    const dateNow = new Date();
    const wordsForReview = wordsState.filter((item) =>
      isDueCheck(item, dateNow),
    );
    return wordsForReview;
  }, [wordsState]);

  useEffect(() => {
    if (!isNumber(wordsToReviewOnMountState)) {
      setWordsToReviewOnMountState(wordsForReviewMemoized.length);
    }
  }, [wordsForReviewMemoized]);

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

  const getTopicStatus = (genTop, todayDateObj) => {
    const allTheseTopics = contentState.filter(
      (el) => el.generalTopicName === genTop,
    );

    if (allTheseTopics.length === 0) {
      return {
        isThisDue: null,
        isThisNew: null,
        hasAllBeenReviewed: null,
      };
    }

    let isThisDue = false;
    let isThisNew = true;
    let hasAllBeenReviewed = true;

    for (const contentEl of allTheseTopics) {
      // --- Check for due items
      if (!isThisDue && contentEl.content) {
        for (const transcriptEl of contentEl.content) {
          if (transcriptEl?.reviewData?.due) {
            if (isDueCheck(transcriptEl, todayDateObj)) {
              isThisDue = true;
              break; // no need to check further
            }
          }
        }
      }

      // --- Check if topic is new (any review history means it's not new)
      if (contentEl.reviewHistory && contentEl.reviewHistory.length > 0) {
        isThisNew = false;
      } else {
        hasAllBeenReviewed = false;
      }
    }

    return { isThisDue, isThisNew, hasAllBeenReviewed };
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

  const handleDeleteWordDataProvider = async ({ wordId }) => {
    try {
      await deleteWordAPI({ wordId, language: languageSelectedState });
      dispatchWords({ type: 'removeWord', wordId });

      return true;
    } catch (error) {
      console.log('## handleDeleteWordDataProvider deleteWord', { error });
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

  const handleGetComprehensiveReview = () => {
    // setSelectedContentState({
    //   content: checkHowManyOfTopicNeedsReview(),
    //   title: generalTopicDisplayNameSelectedState,
    //   isFullReview: true,
    // });
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
      // if (selectedContentState?.isFullReview) {
      //   const updatedReviewSpecificState = selectedContentState.content.map(
      //     (sentenceData) => {
      //       if (sentenceData.id === sentenceId) {
      //         const { sentenceStructure, vocab, meaning } = resObj;
      //         return {
      //           ...sentenceData,
      //           sentenceStructure,
      //           vocab,
      //           meaning,
      //         };
      //       }
      //       return sentenceData;
      //     },
      //   );
      // setSelectedContentState({
      //   ...selectedContentState,
      //   content: updatedReviewSpecificState,
      // });
      // }

      return true;
    } catch (error) {
      console.log('## breakdownSentence', { error });
    }
  };

  return (
    <DataContext.Provider
      value={{
        pureWordsMemoized,
        handleSaveWord,
        wordsState,
        handleDeleteWordDataProvider,
        updateSentenceData,
        contentState,
        sentenceReviewBulk,
        breakdownSentence,
        updateContentMetaData,
        generalTopicDisplayNameMemoized,
        handleGetComprehensiveReview,
        updateWordDataProvider,
        sentencesState,
        updateAdhocSentenceData,
        toastMessageState,
        setToastMessageState,
        wordBasketState,
        setWordBasketState,
        story,
        setStory,
        addGeneratedSentence,
        addImageDataProvider,
        getTopicStatus,
        wordsForReviewMemoized,
        wordsToReviewOnMountState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
