'use client';
import { createContext, useMemo } from 'react';
import { getAudioURL } from '../../utils/get-media-url';
import { isDueCheck } from '@/utils/is-due-check';
import { useFetchData } from './FetchDataProvider';

export const DataContext = createContext(null);

export const DataProvider = ({ children }: PropsWithChildren<object>) => {
  const {
    dispatchSentences,
    dispatchWords,
    contentState,
    languageSelectedState,
    wordsForReviewMemoized,
    story,
    setStory,
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

  const squashedSentenceIdsViaContentMemoized = useMemo(() => {
    const generalTopicsObject = generalTopicDisplayNameMemoized.reduce(
      (acc, key) => {
        acc[key?.title] = [];
        return acc;
      },
      {},
    );

    contentState.forEach((contentEl) => {
      const isInGeneralTopicObject =
        generalTopicsObject[contentEl?.generalTopicName];
      if (isInGeneralTopicObject) {
        generalTopicsObject[contentEl?.generalTopicName].push(
          ...contentEl.content.map((transcriptItem) => transcriptItem.id),
        );
      }
    });

    return generalTopicsObject;
  }, [generalTopicDisplayNameMemoized]);

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

    const collectiveSentenceIds = [];

    for (const contentEl of allTheseTopics) {
      // --- Check for due items
      if (!isThisDue && contentEl.content) {
        for (const transcriptEl of contentEl.content) {
          collectiveSentenceIds.push(transcriptEl.id);
          if (transcriptEl?.reviewData?.due && !isThisDue) {
            if (isDueCheck(transcriptEl, todayDateObj)) {
              isThisDue = true;
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

    const numberOfDueWords = wordsForReviewMemoized.filter((wordObj) =>
      squashedSentenceIdsViaContentMemoized[genTop]?.includes(
        wordObj?.contexts?.[0],
      ),
    ).length;

    return { isThisDue, isThisNew, hasAllBeenReviewed, numberOfDueWords };
  };

  return (
    <DataContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
        addImageDataProvider,
        getTopicStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
