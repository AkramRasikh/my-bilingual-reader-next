import { useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import { Snippet } from '@/app/types/content-types';

type UseSnippetDueMemoizedArgs = {
  snippetsWithVocab: Snippet[] | undefined | null;
  enableSnippetReviewState: boolean;
};

type SnippetDueMemoized = {
  snippetsWithDueStatusMemoized: Snippet[];
  earliestSnippetDueTime: number | null;
};

export const useSnippetDueMemoized = ({
  snippetsWithVocab,
  enableSnippetReviewState,
}: UseSnippetDueMemoizedArgs): SnippetDueMemoized => {
  return useMemo(() => {
    if (
      !snippetsWithVocab ||
      snippetsWithVocab.length === 0 ||
      !enableSnippetReviewState
    ) {
      return {
        snippetsWithDueStatusMemoized: [],
        earliestSnippetDueTime: null,
      };
    }
    const now = new Date();

    const snippetsWithDueStatusMemoized = [] as Snippet[];
    snippetsWithVocab.forEach((item) => {
      if (isDueCheck(item, now)) {
        snippetsWithDueStatusMemoized.push(item);
      }
    });

    const earliestSnippetDueTime =
      enableSnippetReviewState && snippetsWithDueStatusMemoized.length > 0
        ? snippetsWithDueStatusMemoized.reduce((earliest, curr) =>
            curr.time < earliest.time ? curr : earliest,
          ).time
        : null;

    return {
      snippetsWithDueStatusMemoized,
      earliestSnippetDueTime,
    };
  }, [snippetsWithVocab, enableSnippetReviewState]);
};
