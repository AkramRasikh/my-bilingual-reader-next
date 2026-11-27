import { useEffect, useMemo } from 'react';
import { isWithinInterval } from '@/utils/is-within-interval';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { isWordInCustomSnippetFocus } from '../sentence-snippets/sentence-snippet-utils';

/**
 * "Only words in custom snippets": keep a due word only when a sentence
 * snippet's focusedText contains its surface or base form.
 */
export const filterWordsForCustomSnippetReview = <
  T extends Pick<WordTypes, 'surfaceForm' | 'baseForm'>,
>(
  words: T[],
  sentenceSnippets: Snippet[],
  onlyWordsInCustomSnippets: boolean,
): T[] =>
  onlyWordsInCustomSnippets
    ? words.filter((word) => isWordInCustomSnippetFocus(word, sentenceSnippets))
    : words;

type Params = {
  enableWordReviewState: boolean;
  enableSnippetReviewState: boolean;
  enableTranscriptReviewState: boolean;
  firstTime: number | null;
  firstTimeState: number | null;
  setFirstTimeState: React.Dispatch<React.SetStateAction<number | null>>;
  reviewIntervalState: number;
  contentMetaWordMemoized: WordTypes[];
  snippetsWithDueStatusMemoized: Snippet[];
  formattedTranscriptState: FormattedTranscriptTypes[];
  onlyWordsInCustomSnippets?: boolean;
  sentenceSnippets?: Snippet[];
};

export default function useComprehensiveReviewModeData({
  enableWordReviewState,
  enableSnippetReviewState,
  enableTranscriptReviewState,
  firstTime,
  firstTimeState,
  setFirstTimeState,
  reviewIntervalState,
  contentMetaWordMemoized,
  snippetsWithDueStatusMemoized,
  formattedTranscriptState,
  onlyWordsInCustomSnippets = false,
  sentenceSnippets = [],
}: Params) {
  const postWordsUnfilteredMemoized = useMemo(() => {
    if (!enableWordReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return contentMetaWordMemoized.filter((item) =>
        isWithinInterval(item, firstTimeState, reviewIntervalState),
      );
    }
    return [];
  }, [
    enableWordReviewState,
    firstTimeState,
    reviewIntervalState,
    contentMetaWordMemoized,
  ]);

  const postWordsMemoized = useMemo(
    () =>
      filterWordsForCustomSnippetReview(
        postWordsUnfilteredMemoized,
        sentenceSnippets,
        onlyWordsInCustomSnippets,
      ),
    [postWordsUnfilteredMemoized, sentenceSnippets, onlyWordsInCustomSnippets],
  );

  const postSnippetsMemoized = useMemo(() => {
    if (!enableSnippetReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return (
        snippetsWithDueStatusMemoized.filter((item) =>
          isWithinInterval(item, firstTimeState, reviewIntervalState),
        ) || []
      );
    }
    return [];
  }, [
    enableSnippetReviewState,
    firstTimeState,
    reviewIntervalState,
    snippetsWithDueStatusMemoized,
  ]);

  const slicedTranscriptArray = useMemo(() => {
    if (firstTimeState === null) {
      return [];
    }
    const indexFirstTime = formattedTranscriptState.findIndex(
      (item) => item.time >= firstTimeState,
    );
    const timeWithInterval = firstTimeState + reviewIntervalState;

    let indexLastTime = formattedTranscriptState.findIndex(
      (item) => item.time >= timeWithInterval,
    );
    if (indexLastTime === -1) {
      indexLastTime = formattedTranscriptState.length;
    }

    return formattedTranscriptState.slice(indexFirstTime, indexLastTime);
  }, [formattedTranscriptState, firstTimeState, reviewIntervalState]);

  const transcriptDueNumber = useMemo(() => {
    return slicedTranscriptArray.filter((item) => item.isDue);
  }, [slicedTranscriptArray]);

  const postSentencesMemoized = useMemo(() => {
    if (!enableTranscriptReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return transcriptDueNumber;
    }
    return [];
  }, [
    enableTranscriptReviewState,
    firstTimeState,
    reviewIntervalState,
    formattedTranscriptState,
    transcriptDueNumber,
  ]);

  useEffect(() => {
    if (
      postSentencesMemoized.length === 0 &&
      postWordsMemoized.length === 0 &&
      postSnippetsMemoized.length === 0
    ) {
      setFirstTimeState(firstTime);
    } else if (
      firstTime !== null &&
      firstTimeState !== null &&
      firstTime < firstTimeState
    ) {
      setFirstTimeState(firstTime);
    }
  }, [
    postSentencesMemoized,
    postWordsMemoized,
    postSnippetsMemoized,
    firstTime,
    firstTimeState,
    setFirstTimeState,
  ]);

  return {
    postWordsMemoized,
    postWordsUnfilteredCount: postWordsUnfilteredMemoized.length,
    postSnippetsMemoized,
    slicedTranscriptArray,
    transcriptDueNumber,
    postSentencesMemoized,
  };
}
