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
import { sentenceReviewBulkAPI } from './bulk-sentence-review';
import { breakdownSentenceAPI } from './breakdown-sentence';
import { updateContentMetaDataAPI } from './update-content-meta-data';

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
  const [selectedContentState, setSelectedContentState] = useState(null);
  const [generalTopicDisplayNameState, setGeneralTopicDisplayNameState] =
    useState([]);
  const [
    generalTopicDisplayNameSelectedState,
    setGeneralTopicDisplayNameSelectedState,
  ] = useState('');

  const wordsFromSentences = [];

  const getYoutubeID = (generalName) =>
    contentState
      .find((item) => item.generalTopicName === generalName && item?.url)
      .url.split('=')[1];

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
    setContentState((prev) => {
      const newContent = [...prev]; // clone top-level array

      const topic = { ...newContent[contentIndex] }; // clone topic object
      const updatedContent = topic.content.map((s) =>
        s.id === sentenceId ? (({ reviewData, ...rest }) => rest)(s) : s,
      );

      topic.content = updatedContent;
      newContent[contentIndex] = topic;

      return newContent;
    });
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

  const checkIsThereFollowingContent = (contentIndex, generalTitle) => {
    const isOfSameTopic =
      contentState[contentIndex + 1]?.generalTopicName === generalTitle;
    return isOfSameTopic;
  };

  useEffect(() => {
    if (selectedContentState) {
      setSelectedContentState(contentState[selectedContentState.contentIndex]);
    }
  }, [selectedContentState, contentState]);

  const getNextTranscript = (isNext) => {
    const nextIndex = selectedContentState.contentIndex + (isNext ? +1 : -1);

    const thisContent = contentState.find(
      (item) => item?.title === contentState[nextIndex]?.title,
    );
    setSelectedContentState(thisContent);
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
        language: japanese,
      });

      if (resObj) {
        const updatedState = [...contentState];
        const thisTopicData = updatedState[contentIndex];
        const newTopicState = { ...thisTopicData, ...resObj };
        updatedState[contentIndex] = {
          ...newTopicState,
        };
        setContentState(updatedState);

        return newTopicState;
      }
    } catch (error) {
      console.log('## updateContentMetaData', error);
    }
  };

  const sentenceReviewBulk = async ({
    fieldToUpdate,
    topicName,
    contentIndex,
    removeReview,
  }) => {
    try {
      const updatedContentRes = await sentenceReviewBulkAPI({
        title: topicName,
        fieldToUpdate,
        language: japanese,
        removeReview,
      });

      if (updatedContentRes) {
        const updatedState = [...contentState];
        const thisTopicData = updatedState[contentIndex];
        const newTopicState = { ...thisTopicData, ...updatedContentRes };
        updatedState[contentIndex] = {
          ...newTopicState,
        };
        setContentState(updatedState);

        return newTopicState;
      }
    } catch (error) {
      console.log('## sentenceReviewBulk error', error);
    }
  };

  const breakdownSentence = async ({
    topicName,
    sentenceId,
    language,
    targetLang,
    contentIndex,
  }) => {
    try {
      const resObj = await breakdownSentenceAPI({
        topicName,
        sentenceId,
        targetLang,
        language,
      });

      const updatedState = [...contentState];
      const thisTopicData = updatedState[contentIndex];

      const updatedContent = thisTopicData.content.map((sentenceData) => {
        if (sentenceData.id === sentenceId) {
          return {
            ...sentenceData,
            ...resObj,
          };
        }
        return sentenceData;
      });

      updatedState[contentIndex] = {
        ...thisTopicData,
        content: updatedContent,
      };

      setContentState(updatedState);

      return true;
    } catch (error) {
      console.log('## breakdownSentence', { error });
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
        contentState,
        selectedContentState,
        setSelectedContentState,
        sentenceReviewBulk,
        breakdownSentence,
        updateContentMetaData,
        getNextTranscript,
        checkIsThereFollowingContent,
        generalTopicDisplayNameState,
        setGeneralTopicDisplayNameState,
        generalTopicDisplayNameSelectedState,
        setGeneralTopicDisplayNameSelectedState,
        getYoutubeID,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
