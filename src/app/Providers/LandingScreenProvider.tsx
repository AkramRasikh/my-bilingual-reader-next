'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { useFetchData } from './FetchDataProvider';
import { ContentStateTypes } from '../reducers/content-reducer';

import { ContentTranscriptTypes } from '../types/content-types';

export interface LandingScreenComprehensiveType {
  title: ContentStateTypes['title'];
  youtubeId: string;
  isThisDue: number;
  snippetsDue: number;
  numberOfDueWords: number;
  isThisNew: boolean;
}

export interface LandingScreenProviderTypes {
  generalTopicDisplayNameMemoized: LandingScreenComprehensiveType[];
}

export const LandingScreenContext = createContext<LandingScreenProviderTypes>({
  generalTopicDisplayNameMemoized: [],
});

type LandingScreenProviderProps = {
  children: ReactNode;
};

export const LandingScreenProvider = ({
  children,
}: LandingScreenProviderProps) => {
  const { contentState, wordsForReviewMemoized } = useFetchData();

  const generalTopicDisplayNameMemoized = useMemo(() => {
    const contentMetaData: LandingScreenComprehensiveType[] = [];
    const squashedSentenceIdsViaContentMemoized = {} as Record<
      ContentStateTypes['id'],
      ContentTranscriptTypes['id'][]
    >;
    contentState.forEach((contentItem) => {
      const timeNow = new Date();
      const title = contentItem.title;
      const thisContentTranscripts = contentItem.content;
      const thisContentSnippets = contentItem?.snippets;
      const youtubeId = contentItem.url.split('=')[1];

      const mappedSentenceIds = thisContentTranscripts.map(
        (transcriptItem) => transcriptItem.id,
      );
      squashedSentenceIdsViaContentMemoized[title] = mappedSentenceIds;

      const numberOfDueWords = wordsForReviewMemoized.filter((wordObj) =>
        mappedSentenceIds.includes(wordObj?.contexts?.[0]),
      ).length;

      contentMetaData.push({
        youtubeId,
        title,
        isThisDue: thisContentTranscripts.filter((transcriptItem) =>
          isDueCheck(transcriptItem, timeNow),
        ).length,
        snippetsDue:
          thisContentSnippets?.filter((snippetItem) =>
            isDueCheck(snippetItem, timeNow),
          ).length || 0,
        numberOfDueWords,
        isThisNew: Boolean(
          contentItem.reviewHistory && contentItem.reviewHistory.length > 0,
        ),
      });
    });

    return contentMetaData;
  }, [contentState]);

  return (
    <LandingScreenContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
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
