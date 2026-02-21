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
  isTrimmed: boolean;
};

export const getOverlappingText = (
  overlappingSnippetDataMemoised: OverlappingSnippetData[],
  loopedTranscriptMemoized: FormattedTranscriptTypes[],
  isTrimmed: boolean,
) => {
  const overlappingIds = overlappingSnippetDataMemoised.map((item) => item.id);
  const entries = loopedTranscriptMemoized.filter((x) =>
    overlappingIds.includes(x.id),
  );

  const hasMultipleEntries = entries.length > 1;

  let targetLang: string;
  let baseLang: string;
  if (!isTrimmed && hasMultipleEntries) {
    targetLang = entries
      .map((item, idx) =>
        idx === entries.length - 1 ? item.targetLang : item.targetLang + ' ',
      )
      .join('');
    baseLang = entries
      .map((item, idx) =>
        idx === entries.length - 1 ? item.baseLang : item.baseLang + ' ',
      )
      .join('');
  } else {
    targetLang = entries.map((item) => item.targetLang).join('');
    baseLang = entries.map((item) => item.baseLang).join('');
  }

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
  isTrimmed,
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
      isTrimmed,
    );
  }, [
    overlappingSnippetDataMemoised,
    threeSecondLoopState,
    loopedTranscriptMemoized,
    isTrimmed,
  ]);
};
