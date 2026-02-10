import { useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { WordTypes } from '@/app/types/word-types';
import { FormattedTranscriptTypes } from '@/app/types/content-types';

type TopicWordForReview = WordTypes & { time?: number };

type UseTopicWordsForReviewMemoizedArgs = {
  learnFormattedTranscript: FormattedTranscriptTypes[];
  isInReviewMode: boolean;
  wordsForSelectedTopicMemoized: WordTypes[];
};

export const useTopicWordsForReviewMemoized = ({
  learnFormattedTranscript,
  isInReviewMode,
  wordsForSelectedTopicMemoized,
}: UseTopicWordsForReviewMemoizedArgs): TopicWordForReview[] => {
  return useMemo(() => {
    if (!isInReviewMode || wordsForSelectedTopicMemoized?.length === 0) {
      return [];
    }

    const sentenceIdsForReview = [] as FormattedTranscriptTypes['id'][];

    learnFormattedTranscript.forEach((transcriptEl) => {
      if (transcriptEl.isDue) {
        sentenceIdsForReview.push(transcriptEl.id);
      }
    });

    if (sentenceIdsForReview.length === 0) {
      return [];
    }
    const now = new Date();
    const topicWordsForReviewMemoized = [] as TopicWordForReview[];
    wordsForSelectedTopicMemoized.forEach((wordItem) => {
      const firstContext = wordItem.contexts[0];

      if (
        sentenceIdsForReview.includes(firstContext) &&
        isDueCheck(wordItem, now)
      ) {
        topicWordsForReviewMemoized.push({
          ...wordItem,
          time: learnFormattedTranscript.find(
            (item) => item.id === firstContext,
          )?.time,
        });
      }
    });

    return topicWordsForReviewMemoized;
  }, [learnFormattedTranscript, isInReviewMode, wordsForSelectedTopicMemoized]);
};
