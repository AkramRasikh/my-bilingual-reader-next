import { useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { WordTypes } from '@/app/types/word-types';
import { Snippet } from '@/app/types/content-types';
import { getWordTimeFromSnippets } from '@/utils/get-word-time-from-snippets';

type UseWordMetaMemoizedArgs = {
  selectedContentTitleState: string;
  wordsState: WordTypes[];
  enableWordReviewState: boolean;
  contentSnippets: Snippet[];
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
  contentSnippets,
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
        // Get more precise time from overlapping snippets
        const snippetTime = getWordTimeFromSnippets(wordItem, contentSnippets);
        const wordWithPreciseTime = {
          ...wordItem,
          time: snippetTime ?? wordItem.time,
        };

        allWords.push(wordWithPreciseTime);
        if (wordWithPreciseTime.isDue) {
          dueWords.push(wordWithPreciseTime);
        } else if (isDueCheck(wordWithPreciseTime, now)) {
          dueWords.push(wordWithPreciseTime);
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
  }, [
    selectedContentTitleState,
    wordsState,
    enableWordReviewState,
    contentSnippets,
  ]);
};
