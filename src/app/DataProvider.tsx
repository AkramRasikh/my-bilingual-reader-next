'use client';
import { createContext, useEffect, useState } from 'react';
import saveWordAPI from './save-word';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsRetentionKeyTypes,
} from './srs-algo';
import {
  makeArrayUnique,
  useHighlightWordToWordBank,
} from './useHighlightWordToWordBank';
import { deleteWordAPI } from './delete-word';
import { japanese } from './languages';
import { updateSentenceDataAPI } from './update-sentence-api';
import { sentenceReviewBulkAPI } from './bulk-sentence-review';
import { breakdownSentenceAPI } from './breakdown-sentence';
import { updateContentMetaDataAPI } from './update-content-meta-data';
import { updateAdhocSentenceAPI } from './update-adhoc-sentence';

export const DataContext = createContext(null);

export const isDueCheck = (sentence, todayDateObj) => {
  return (
    (sentence?.nextReview && sentence.nextReview < todayDateObj) ||
    new Date(sentence?.reviewData?.due) < todayDateObj
  );
};

export const DataProvider = ({
  sortedContent,
  targetLanguageLoadedSentences,
  targetLanguageLoadedWords,
  children,
}: PropsWithChildren<object>) => {
  const [wordsState, setWordsState] = useState(targetLanguageLoadedWords);
  const [sentencesState, setSentencesState] = useState([]);
  const [story, setStory] = useState();
  const [contentState, setContentState] = useState(sortedContent);
  const [pureWordsState, setPureWordsState] = useState([]);
  const [selectedContentState, setSelectedContentState] = useState(null);
  const [generalTopicDisplayNameState, setGeneralTopicDisplayNameState] =
    useState([]);
  const [wordBasketState, setWordBasketState] = useState([]);

  const [wordsForSelectedTopic, setWordsForSelectedTopic] = useState([]);
  const [
    generalTopicDisplayNameSelectedState,
    setGeneralTopicDisplayNameSelectedState,
  ] = useState('');
  const [toastMessageState, setToastMessageState] = useState('');
  const [isSentenceReviewState, setIsSentenceReviewState] = useState(false);

  const wordsFromSentences = [];

  const { underlineWordsInSentence } = useHighlightWordToWordBank({
    pureWordsUnique: pureWordsState,
  });

  useEffect(() => {
    if (selectedContentState && wordsState?.length > 0) {
      const dateNow = new Date();
      const wordsForThisTopic = getSelectedTopicsWords();
      const sortedWordsForThisTopic = wordsForThisTopic?.sort(
        (a, b) => isDueCheck(b, dateNow) - isDueCheck(a, dateNow),
      );
      setWordsForSelectedTopic(sortedWordsForThisTopic);
    }
  }, [wordsState, selectedContentState]);

  useEffect(() => {
    if (
      sentencesState.length === 0 &&
      targetLanguageLoadedSentences.length > 0 &&
      pureWordsState.length > 0
    ) {
      const dateNow = new Date();
      const dueCardsNow = targetLanguageLoadedSentences.filter((sentence) =>
        isDueCheck(sentence, dateNow),
      );

      const formatSentence = dueCardsNow?.map((item) => {
        return {
          ...item,
          targetLangformatted: underlineWordsInSentence(item.targetLang),
        };
      });
      setSentencesState(formatSentence);
    }
  }, [sentencesState, pureWordsState]);

  const handleSelectedContent = (thisYoutubeTitle) => {
    const thisContent = contentState.find(
      (item) => item?.title === thisYoutubeTitle,
    );
    setSelectedContentState(thisContent);
  };

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

  const updateWordDataProvider = async ({
    wordId,
    fieldToUpdate,
    language,
    isRemoveReview,
  }) => {
    try {
      if (isRemoveReview) {
        const res = await fetch('/api/deleteWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, language }),
        });
        const data = await res.json();
        console.log('## data', data);

        const targetLanguageWordsStateUpdated = wordsState.filter(
          (item) => item.id !== wordId,
        );
        setWordsState(targetLanguageWordsStateUpdated);
        return true;
      } else {
        const res = await fetch('/api/updateWord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, fieldToUpdate, language }),
        });

        const data = await res.json();

        const dateNow = new Date();
        const targetLanguageWordsStateUpdated = wordsState.map((item) => {
          const thisWordId = item.id === wordId;
          if (thisWordId) {
            const isDue = data.reviewData?.due < dateNow;
            return {
              ...item,
              ...data,
              isDue,
            };
          }
          return item;
        });
        setWordsState(targetLanguageWordsStateUpdated);
      }
    } catch (error) {
      console.log('## updateWordDataProvider DataProvider', { error });
    }
  };

  const getSelectedTopicsWords = () => {
    if (!selectedContentState || wordsState?.length === 0) {
      return null;
    }

    const thisTopicsSentenceIds = selectedContentState.content.map((i) => i.id);

    const thisTopicsWordsArr = [];

    wordsState.forEach((word) => {
      const originalContextId = word.contexts[0];
      if (thisTopicsSentenceIds.includes(originalContextId)) {
        thisTopicsWordsArr.push(word);
      }
    });

    return thisTopicsWordsArr;
  };

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

  const checkHowManyOfTopicNeedsReview = () => {
    if (!generalTopicDisplayNameSelectedState) {
      return null;
    }

    const todayDateObj = new Date();

    const sentencesNeedReview = [];
    contentState.forEach((contentEl) => {
      if (contentEl.generalTopicName !== generalTopicDisplayNameSelectedState) {
        return;
      }

      const thisStartTime = contentEl.realStartTime;
      const contentIndex = contentEl.contentIndex;
      const transcript = contentEl.content;
      const generalTopicName = contentEl.generalTopicName;
      const title = contentEl.title;

      transcript.forEach((transcriptEl) => {
        if (!transcriptEl?.reviewData?.due) {
          return;
        }
        if (isDueCheck(transcriptEl, todayDateObj)) {
          sentencesNeedReview.push({
            ...transcriptEl,
            time: thisStartTime + transcriptEl.time,
            contentIndex,
            title,
            generalTopicName,
          });
        }
      });
    });

    return sentencesNeedReview;
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
    // figure out conditions here
    if (selectedContentState && !selectedContentState?.isFullReview) {
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

  const updateAdhocSentenceData = async ({
    sentenceId,
    fieldToUpdate,
    isRemoveReview,
  }) => {
    try {
      const updatedFieldFromDB = await updateAdhocSentenceAPI({
        sentenceId,
        fieldToUpdate,
        language: japanese,
      });

      if (updatedFieldFromDB) {
        const dateNow = new Date();
        const updatedSentencesState = sentencesState
          .map((item) => {
            const matchedId = sentenceId === item.id;
            if (matchedId && isRemoveReview) {
              delete item.reviewData;
              return item;
            } else if (matchedId) {
              return {
                ...item,
                ...updatedFieldFromDB,
              };
            }
            return item;
          })
          .filter((i) => isDueCheck(i, dateNow));

        setSentencesState(updatedSentencesState);

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

      if (selectedContentState?.isFullReview) {
        // filter out ASSUMING its date() based
        const updatedReviewSpecificState = selectedContentState.content.filter(
          (sentenceData) => sentenceData.id !== sentenceId,
        );
        setSelectedContentState({
          ...selectedContentState,
          content: updatedReviewSpecificState,
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

  const handleGetComprehensiveReview = () => {
    setSelectedContentState({
      content: checkHowManyOfTopicNeedsReview(),
      title: generalTopicDisplayNameSelectedState,
      isFullReview: true,
    });
  };

  const addGeneratedSentence = async ({ targetLang, baseLang, notes }) => {
    console.log('## addGeneratedSentence', targetLang, baseLang);

    const res = await fetch('/api/addSentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'japanese',
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
      });
    }

    setSentencesState([...sentencesState, data]);
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

      if (selectedContentState?.isFullReview) {
        const updatedReviewSpecificState = selectedContentState.content.map(
          (sentenceData) => {
            if (sentenceData.id === sentenceId) {
              return {
                ...sentenceData,
                ...resObj,
              };
            }
            return sentenceData;
          },
        );
        setSelectedContentState({
          ...selectedContentState,
          content: updatedReviewSpecificState,
        });
      }

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
        checkHowManyOfTopicNeedsReview,
        handleGetComprehensiveReview,
        getSelectedTopicsWords,
        wordsForSelectedTopic,
        updateWordDataProvider,
        sentencesState,
        updateAdhocSentenceData,
        toastMessageState,
        setToastMessageState,
        isSentenceReviewState,
        setIsSentenceReviewState,
        wordBasketState,
        setWordBasketState,
        story,
        setStory,
        addGeneratedSentence,
        handleSelectedContent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
