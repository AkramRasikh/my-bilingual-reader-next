import { useMemo } from 'react';
import { isNumber } from '@/utils/is-number';
import { isDueCheck } from '@/utils/is-due-check';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { WordTypes } from '@/app/types/word-types';
import {
  ContentTypes,
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
} from '@/app/types/content-types';

type UseTranscriptMetaMemoizedArgs = {
  content: ContentTypes['content'];
  enableTranscriptReviewState: boolean;
  wordsState: WordTypes[];
};

type TranscriptMetaMemoized = {
  firstDueIndexMemoized: number | null;
  formattedTranscriptMemoized: FormattedTranscriptTypes[];
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  sentencesNeedReview: number;
  sentencesPendingOrDue: number;
  firstSentenceDueTime: number | null;
};

export const useTranscriptMetaMemoized = ({
  content,
  enableTranscriptReviewState,
  wordsState,
}: UseTranscriptMetaMemoizedArgs): TranscriptMetaMemoized => {
  return useMemo(() => {
    const now = new Date();
    let firstDueIndexMemoized: number | null = null;
    let sentencesNeedReview = 0;
    let sentencesPendingOrDue = 0;
    let firstSentenceDueTime: number | null = null;

    const formattedTranscriptMemoized = content.map((item, index) => {
      const hasBeenReviewed = item?.reviewData?.due;
      if (hasBeenReviewed) {
        sentencesPendingOrDue += 1;
      }
      const isDueNow = isDueCheck(item, now);

      if (isDueNow) {
        sentencesNeedReview += 1;
        if (!isNumber(firstDueIndexMemoized)) {
          if (enableTranscriptReviewState) {
            firstSentenceDueTime = item.time;
          }
          firstDueIndexMemoized = index;
          if (isNumber(firstDueIndexMemoized) && firstDueIndexMemoized > 0) {
            firstDueIndexMemoized = firstDueIndexMemoized - 1;
          }
        }
      }

      const wordsFromSentence = findAllInstancesOfWordsInSentence(
        item.targetLang,
        wordsState,
      );

      const targetLangformatted = underlineWordsInSentence(
        item.targetLang,
        wordsFromSentence,
      );

      const nextItem = content[index + 1];
      const nextIsDueNow = isDueCheck(nextItem, now);
      const helperReviewSentence = !!(index > 0 && nextIsDueNow);

      return {
        ...item,
        isDue: isDueNow,
        targetLangformatted,
        wordsFromSentence,
        helperReviewSentence,
      } as FormattedTranscriptTypes;
    });

    const sentenceMapMemoized: Record<string, SentenceMapItemTypes> = {};
    for (let i = 0; i < formattedTranscriptMemoized.length; i++) {
      const current = formattedTranscriptMemoized[i];
      const prev = formattedTranscriptMemoized[i - 1];
      const next = formattedTranscriptMemoized[i + 1];
      sentenceMapMemoized[current.id] = {
        ...current,
        index: i,
        prevSentence: prev ? prev.time : null,
        thisSentence: current.time,
        targetLang: current.targetLang,
        isUpForReview: Boolean(current?.reviewData),
        baseLang: current.baseLang,
        nextSentence: next ? next.time : null,
      };
    }

    return {
      firstDueIndexMemoized,
      formattedTranscriptMemoized,
      sentenceMapMemoized,
      sentencesNeedReview,
      sentencesPendingOrDue,
      firstSentenceDueTime,
    };
  }, [content, enableTranscriptReviewState, wordsState]);
};
