import { useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { WordTypes } from '@/app/types/word-types';

type UseWordMetaMemoizedArgs = {
  selectedContentTitleState: string;
  wordsState: WordTypes[];
  enableWordReviewState: boolean;
};

type WordMetaMemoized = {
  contentMetaWordMemoized: WordTypes[];
  wordsForSelectedTopicMemoized: WordTypes[];
  firstWordDueTime: number | null;
};

export const useWordMetaMemoized = ({
  selectedContentTitleState,
  wordsState,
  enableWordReviewState,
}: UseWordMetaMemoizedArgs): WordMetaMemoized => {
  return useMemo(() => {
    if (wordsState.length === 0) {
      return {
        contentMetaWordMemoized: [],
        wordsForSelectedTopicMemoized: [],
        firstWordDueTime: null,
      };
    }

    const now = new Date();

    const allWords = [] as WordTypes[];
    const dueWords = [] as WordTypes[];

    wordsState.forEach((wordItem) => {
      if (wordItem.originalContext === selectedContentTitleState) {
        allWords.push(wordItem);
        if (wordItem.isDue) {
          dueWords.push(wordItem);
        } else if (isDueCheck(wordItem, now)) {
          dueWords.push(wordItem);
        }
      }
    });

    const sortedAllWords = allWords.sort(
      (a, b) => Number(b.isDue) - Number(a.isDue),
    );

    const firstWordDueTime =
      enableWordReviewState && dueWords.length > 0
        ? (dueWords.reduce((earliest, curr) =>
            (curr.time ?? Infinity) < (earliest.time ?? Infinity)
              ? curr
              : earliest,
          ).time ?? null)
        : null;

    return {
      contentMetaWordMemoized: dueWords,
      wordsForSelectedTopicMemoized: sortedAllWords,
      firstWordDueTime,
    };
  }, [selectedContentTitleState, wordsState, enableWordReviewState]);
};
