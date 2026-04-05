import { useEffect, useMemo } from 'react';
import { isWithinInterval } from '@/utils/is-within-interval';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';

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
}: Params) {
  const postWordsMemoized = useMemo(() => {
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
    postSnippetsMemoized,
    slicedTranscriptArray,
    transcriptDueNumber,
    postSentencesMemoized,
  };
}
