'use client';
import { createContext, useEffect, useState } from 'react';
import saveWordAPI from './save-word';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from './srs-algo';
import { makeArrayUnique } from './useHighlightWordToWordBank';
import { deleteWordAPI } from './delete-word';
import { japanese } from './languages';
import { updateSentenceDataAPI } from './update-sentence-api';

export const DataContext = createContext(null);

export const DataProvider = ({
  sortedContent,
  targetLanguageLoadedSentences,
  targetLanguageLoadedWords,
  children,
}: PropsWithChildren<object>) => {
  const [wordsState, setWordsState] = useState(targetLanguageLoadedWords);
  const [contentState, setContentState] = useState(sortedContent);
  const [pureWordsState, setPureWordsState] = useState([]);

  const wordsFromSentences = [];

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

    targetLanguageLoadedSentences?.forEach((sentence) => {
      if (sentence?.matchedWordsSurface) {
        sentence?.matchedWordsSurface.forEach((item, index) => {
          if (item && !pureWords.includes(item)) {
            pureWords.push(item);
            wordsFromSentences.push({
              wordId: sentence?.matchedWordsId[index],
              word: item,
            });
          }
        });
      }
    });
    const pureWordsUnique =
      pureWords?.length > 0 ? makeArrayUnique(pureWords) : [];
    return pureWordsUnique;
  };

  useEffect(() => {
    const pureWords = getPureWords();
    setPureWordsState(pureWords);
  }, [wordsState]);

  const removeReviewFromContentStateFunc = ({ sentenceId, contentIndex }) => {
    const thisTopicData = contentState[contentIndex];
    const sentenceIndex = thisTopicData.content.findIndex(
      (s) => s.id === sentenceId,
    );

    if (sentenceIndex !== -1) {
      const { reviewData, ...updatedSentence } =
        thisTopicData.content[sentenceIndex]; // Remove `reviewData`
      thisTopicData.content[sentenceIndex] = updatedSentence; // Replace with updated object
    }
    setContentState(thisTopicData);
  };

  const updateSentenceDataFromContent = ({
    sentenceId,
    fieldToUpdate,
    contentIndex,
  }) => {
    setContentState((prev) => {
      const newContent = [...prev]; // clone top-level array
      const thisTopicData = { ...newContent[contentIndex] }; // clone topic
      const newContentList = thisTopicData.content.map((s) =>
        s.id === sentenceId ? { ...s, ...fieldToUpdate } : s,
      );
      thisTopicData.content = newContentList;
      newContent[contentIndex] = thisTopicData;
      return newContent;
    });
  };

  const updateSentenceData = async ({
    topicName,
    sentenceId,
    fieldToUpdate,
    contentIndex,
    isRemoveReview,
  }) => {
    try {
      // setUpdatingSentenceState(sentenceId);
      const updatedFieldFromDB = await updateSentenceDataAPI({
        topicName,
        sentenceId,
        fieldToUpdate,
        language: japanese,
      });

      if (isRemoveReview) {
        removeReviewFromContentStateFunc({ sentenceId, contentIndex });
      } else {
        updateSentenceDataFromContent({
          sentenceId,
          fieldToUpdate: updatedFieldFromDB,
          contentIndex,
        });
      }

      return updatedFieldFromDB;
    } catch (error) {
      console.log('## updateSentenceData', { error });
      // updatePromptFunc(`Error updating sentence for ${topicName}`);
    } finally {
      // setUpdatingSentenceState('');
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
    });

    if (savedWord) {
      const newWordsState = [...wordsState, savedWord];
      setWordsState(newWordsState);
    }
    return savedWord;
  };

  const handleDeleteWordDataProvider = async ({ wordId, wordBaseForm }) => {
    try {
      await deleteWordAPI({ wordId, language: japanese });
      const targetLanguageWordsStateUpdated = wordsState.filter(
        (item) => item.id !== wordId,
      );
      setWordsState(targetLanguageWordsStateUpdated);
      return true;
    } catch (error) {
      // setUpdatePromptState(`Error deleting ${wordBaseForm} 😟!`);
      // setTimeout(() => setUpdatePromptState(''), 3000);
      console.log('## handleDeleteWordDataProvider deleteWord', { error });
    }
  };

  return (
    <DataContext.Provider
      value={{
        targetLanguageLoadedWords,
        pureWords: pureWordsState,
        handleSaveWord,
        wordsState,
        setWordsState,
        handleDeleteWordDataProvider,
        updateSentenceData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
