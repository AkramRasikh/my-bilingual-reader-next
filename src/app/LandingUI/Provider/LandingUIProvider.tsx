'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { useFetchData } from '../../Providers/FetchDataProvider';
import { ContentStateTypes } from '../../reducers/content-reducer';

import { ContentTranscriptTypes } from '../../types/content-types';

export interface LandingUIComprehensiveType {
  title: ContentStateTypes['title'];
  youtubeId: string;
  dueSentences: number;
  dueSnippets: number;
  dueWords: number;
  contentHasBeenReviews: boolean;
}

export interface LandingUIProviderTypes {
  generalTopicDisplayNameMemoized: LandingUIComprehensiveType[];
}

export const LandingUIContext = createContext<LandingUIProviderTypes>({
  generalTopicDisplayNameMemoized: [],
});

type LandingUIProviderProps = {
  children: ReactNode;
};

export const LandingUIProvider = ({ children }: LandingUIProviderProps) => {
  const { contentState, wordsForReviewMemoized } = useFetchData();

  const generalTopicDisplayNameMemoized = useMemo(() => {
    const contentMetaData: LandingUIComprehensiveType[] = [];
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

      const dueWords = wordsForReviewMemoized.filter((wordObj) =>
        mappedSentenceIds.includes(wordObj?.contexts?.[0]),
      ).length;

      contentMetaData.push({
        youtubeId,
        title,
        dueSentences: thisContentTranscripts.filter((transcriptItem) =>
          isDueCheck(transcriptItem, timeNow),
        ).length,
        dueSnippets:
          thisContentSnippets?.filter((snippetItem) =>
            isDueCheck(snippetItem, timeNow),
          ).length || 0,
        dueWords,
        contentHasBeenReviews: Boolean(
          contentItem.reviewHistory && contentItem.reviewHistory.length > 0,
        ),
      });
    });

    return contentMetaData.sort((a, b) => b.dueSentences - a.dueSentences);
  }, [contentState]);

  return (
    <LandingUIContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
      }}
    >
      {children}
    </LandingUIContext.Provider>
  );
};

export const useLandingUI = () => {
  const context = useContext(LandingUIContext);

  if (!context)
    throw new Error('useLandingUI must be used within a LandingUIProvider');

  return context;
};
