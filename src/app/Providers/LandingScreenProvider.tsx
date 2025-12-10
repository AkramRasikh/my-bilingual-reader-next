'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { useFetchData } from './FetchDataProvider';
import { ContentStateTypes } from '../reducers/content-reducer';
import { ContentTranscriptTypes } from '../types/content-types';

export interface GetTopicStatusReturnTypes {
  isThisDue: number;
  snippetsDue: number;
  numberOfDueWords: number;
  isThisNew: boolean;
  hasAllBeenReviewed: boolean;
}

export interface LandingScreenYoutubeWidgetTypes {
  title: ContentStateTypes['title'];
  youtubeId: string;
}

export interface LandingScreenProviderTypes {
  generalTopicDisplayNameMemoized: LandingScreenYoutubeWidgetTypes[];
  getTopicStatus: (
    genTop: ContentStateTypes['title'],
    todayDateObj: Date,
  ) => GetTopicStatusReturnTypes;
}

export const LandingScreenContext = createContext<LandingScreenProviderTypes>({
  generalTopicDisplayNameMemoized: [],
  getTopicStatus: () => ({
    isThisDue: 0,
    snippetsDue: 0,
    numberOfDueWords: 0,
    isThisNew: true,
    hasAllBeenReviewed: true,
  }),
});

type LandingScreenProviderProps = {
  children: ReactNode;
};

export const LandingScreenProvider = ({
  children,
}: LandingScreenProviderProps) => {
  const { contentState, wordsForReviewMemoized } = useFetchData();

  const generalTopicDisplayNameMemoized = useMemo(() => {
    return contentState.map((contentItem) => {
      return {
        youtubeId: contentItem.url.split('=')[1],
        title: contentItem.title,
      };
    });
  }, [contentState]);

  const squashedSentenceIdsViaContentMemoized = useMemo(() => {
    const generalTopicsObject = generalTopicDisplayNameMemoized.reduce<
      Record<ContentStateTypes['title'], ContentTranscriptTypes['id'][]>
    >((acc, key) => {
      acc[key.title] = [];
      return acc;
    }, {});

    contentState.forEach((contentEl) => {
      const isInGeneralTopicObject =
        generalTopicsObject[contentEl.generalTopicName];
      if (isInGeneralTopicObject) {
        generalTopicsObject[contentEl.generalTopicName].push(
          ...contentEl.content.map((transcriptItem) => transcriptItem.id),
        );
      }
    });

    return generalTopicsObject;
  }, [generalTopicDisplayNameMemoized]);

  const getTopicStatus = (
    genTop: ContentStateTypes['title'],
    todayDateObj: Date,
  ): GetTopicStatusReturnTypes => {
    const allTheseTopics = contentState.filter(
      (el) => el.generalTopicName === genTop,
    );

    let isThisDue = 0;
    let snippetsDue = 0;
    let numberOfDueWords = 0;
    let isThisNew = true;
    let hasAllBeenReviewed = true;

    if (allTheseTopics.length === 0) {
      return {
        isThisDue,
        isThisNew,
        hasAllBeenReviewed,
        snippetsDue,
        numberOfDueWords,
      };
    }

    const collectiveSentenceIds = [];

    for (const contentEl of allTheseTopics) {
      // --- Check for due items
      const contentSnippets = contentEl?.snippets;
      if (contentSnippets) {
        for (const snippetEl of contentSnippets) {
          if (isDueCheck(snippetEl, todayDateObj)) {
            snippetsDue = snippetsDue + 1;
          }
        }
      }
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

    numberOfDueWords = wordsForReviewMemoized.filter((wordObj) =>
      squashedSentenceIdsViaContentMemoized[genTop]?.includes(
        wordObj?.contexts?.[0],
      ),
    ).length;

    return {
      isThisDue,
      isThisNew,
      hasAllBeenReviewed,
      numberOfDueWords,
      snippetsDue,
    };
  };

  return (
    <LandingScreenContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
        getTopicStatus,
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
