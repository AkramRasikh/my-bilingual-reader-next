'use client';
import { createContext, useContext, useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { useFetchData } from './FetchDataProvider';

export const LandingScreenContext = createContext(null);

export const LandingScreenProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const {
    contentState,
    wordsForReviewMemoized,
    wordsToReviewGivenOriginalContextId,
  } = useFetchData();

  const {
    generalTopicDisplayNameMemoized,
    nonMediaGeneralTopicDisplayNameMemoized,
    hasScheduledForDeletion,
  } = useMemo(() => {
    const generalNamesArr = [];
    const nonMediaGeneralNamesArr = [];
    let hasScheduledForDeletion = false;

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
      } else if (
        !contentItem?.origin &&
        !generalNamesArr.some((item) => item.title === itemGenName)
      ) {
        const subsections = contentState.filter(
          (contentItem) => itemGenName === contentItem.generalTopicName,
        );
        nonMediaGeneralNamesArr.push({
          title: itemGenName,
          subSections: subsections.map((contentNested) => {
            const squashedSentences = contentNested.content.filter(
              (i) => wordsToReviewGivenOriginalContextId[i.id],
            );
            if (!hasScheduledForDeletion && squashedSentences.length === 0) {
              hasScheduledForDeletion = true;
            }

            return {
              id: contentNested.id,
              title: contentNested.title,
              squashedSentences,
            };
          }),
        });
      }
    }
    return {
      generalTopicDisplayNameMemoized: generalNamesArr,
      nonMediaGeneralTopicDisplayNameMemoized: nonMediaGeneralNamesArr,
      hasScheduledForDeletion,
    };
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

    let isThisDue = 0;
    let isThisNew = true;
    let hasAllBeenReviewed = true;

    const collectiveSentenceIds = [];

    for (const contentEl of allTheseTopics) {
      // --- Check for due items
      if (contentEl.content) {
        for (const transcriptEl of contentEl.content) {
          collectiveSentenceIds.push(transcriptEl.id);
          if (isDueCheck(transcriptEl, todayDateObj)) {
            isThisDue = isThisDue + 1;
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
    <LandingScreenContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
        nonMediaGeneralTopicDisplayNameMemoized,
        getTopicStatus,
        hasScheduledForDeletion,
      }}
    >
      {children}
    </LandingScreenContext.Provider>
  );
};

export const useLandingScreen = () => {
  const context = useContext(LandingScreenContext);

  if (!context)
    throw new Error(
      'useLandingScreen must be used within a LandingScreenProvider',
    );

  return context;
};
