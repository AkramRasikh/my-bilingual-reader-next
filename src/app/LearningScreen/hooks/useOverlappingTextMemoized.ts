import { useMemo } from 'react';
import { sliceTranscriptViaPercentageOverlap } from '../utils/slice-transcript-via-percentage-overlap';
import { FormattedTranscriptTypes } from '@/app/types/content-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

type OverlappingText = {
  targetLang: string;
  baseLang: string;
  suggestedFocusText: string;
};

type UseOverlappingTextMemoizedArgs = {
  threeSecondLoopState: number | null;
  overlappingSnippetDataMemoised: OverlappingSnippetData[] | null | undefined;
  loopedTranscriptMemoized: FormattedTranscriptTypes[];
};

export const getOverlappingText = (
  overlappingSnippetDataMemoised: OverlappingSnippetData[],
  loopedTranscriptMemoized: FormattedTranscriptTypes[],
) => {
  const overlappingIds = overlappingSnippetDataMemoised.map((item) => item.id);
  const entries = loopedTranscriptMemoized.filter((x) =>
    overlappingIds.includes(x.id),
  );
  const targetLang = entries.map((item) => item.targetLang).join('');
  const baseLang = entries.map((item) => item.baseLang).join('');
  return {
    targetLang,
    baseLang,
    suggestedFocusText: sliceTranscriptViaPercentageOverlap(
      overlappingSnippetDataMemoised,
    ),
  };
};

export const useOverlappingTextMemoized = ({
  threeSecondLoopState,
  overlappingSnippetDataMemoised,
  loopedTranscriptMemoized,
}: UseOverlappingTextMemoizedArgs): OverlappingText | null => {
  return useMemo(() => {
    if (
      !threeSecondLoopState ||
      !overlappingSnippetDataMemoised ||
      overlappingSnippetDataMemoised.length === 0
    ) {
      return null;
    }
    return getOverlappingText(
      overlappingSnippetDataMemoised,
      loopedTranscriptMemoized,
    );
  }, [
    overlappingSnippetDataMemoised,
    threeSecondLoopState,
    loopedTranscriptMemoized,
  ]);
};
