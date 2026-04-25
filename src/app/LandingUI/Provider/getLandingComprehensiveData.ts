'use client';

import { isDueCheck } from '@/utils/is-due-check';
import { ContentStateTypes } from '@/app/reducers/content-reducer';
import { WordTypes } from '@/app/types/word-types';

export interface LandingComprehensiveType {
  title: ContentStateTypes['title'];
  youtubeId: string;
  dueSentences: number;
  totalSentencesWithReview: number;
  dueSnippets: number;
  dueWords: number;
  totalWordsWithReview: number;
  contentHasBeenReviews: boolean;
}

interface GetLandingComprehensiveDataParams {
  contentState: ContentStateTypes[];
  wordsState: WordTypes[];
}

const safeParseArray = <T>(value: string | null): T[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as T[] | null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getLandingComprehensiveData = ({
  contentState,
  wordsState,
}: GetLandingComprehensiveDataParams): LandingComprehensiveType[] => {
  const timeNow = new Date();
  const wordsForReview = wordsState.filter((wordObj) => isDueCheck(wordObj, timeNow));

  const contentMetaData: LandingComprehensiveType[] = contentState.map((contentItem) => {
    const thisContentTranscripts = contentItem.content || [];
    const thisContentSnippets = contentItem.snippets || [];
    const mappedSentenceIds = thisContentTranscripts.map((transcriptItem) => transcriptItem.id);
    const youtubeId = contentItem.url?.split('=')[1] || '';

    const dueWords = wordsForReview.filter((wordObj) =>
      mappedSentenceIds.includes(wordObj?.contexts?.[0]),
    ).length;

    const totalWordsWithReview = wordsState.filter(
      (wordObj) =>
        mappedSentenceIds.includes(wordObj?.contexts?.[0]) && Boolean(wordObj.reviewData),
    ).length;

    const totalSentencesWithReview = thisContentTranscripts.filter((transcriptItem) =>
      Boolean(transcriptItem.reviewData),
    ).length;

    return {
      youtubeId,
      title: contentItem.title,
      dueSentences: thisContentTranscripts.filter((transcriptItem) =>
        isDueCheck(transcriptItem, timeNow),
      ).length,
      totalSentencesWithReview,
      dueSnippets: thisContentSnippets.filter((snippetItem) => isDueCheck(snippetItem, timeNow))
        .length,
      dueWords,
      totalWordsWithReview,
      contentHasBeenReviews: Boolean(contentItem.reviewHistory?.length),
    };
  });

  return contentMetaData.sort((a, b) => b.dueSentences - a.dueSentences);
};

export const getLandingComprehensiveDataByLanguage = (
  language: string,
): LandingComprehensiveType[] => {
  const contentState = safeParseArray<ContentStateTypes>(
    localStorage.getItem(`${language}-contentState`),
  );
  const wordsState = safeParseArray<WordTypes>(localStorage.getItem(`${language}-wordsState`));

  return getLandingComprehensiveData({
    contentState,
    wordsState,
  });
};
