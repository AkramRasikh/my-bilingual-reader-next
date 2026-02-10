import { isNumber } from '@/utils/is-number';
import { useEffect, useRef } from 'react';
import { OverlappingSnippetData } from '@/app/types/shared-types';

export const threeSecondLoopLogicLegacy = ({
  refSeconds,
  threeSecondLoopState,
  formattedTranscriptState,
  setState,
  startTime,
  endTime,
  mediaDuration,
}: {
  refSeconds?: React.MutableRefObject<number | null>;
  threeSecondLoopState: number;
  formattedTranscriptState: any[];
  setState?: (data: OverlappingSnippetData[]) => void;
  startTime: number;
  endTime: number;
  mediaDuration?: number;
}): OverlappingSnippetData[] | void => {
  const results: OverlappingSnippetData[] = [];

  formattedTranscriptState.forEach((item, index) => {
    const start = item.time;
    const end = item?.nextSentence
      ? item.nextSentence
      : mediaDuration
        ? mediaDuration
        : index < formattedTranscriptState.length - 1
          ? formattedTranscriptState[index + 1].time
          : start;
    const duration = end - start;

    const overlapStart = Math.max(start, startTime);
    const overlapEnd = Math.min(end, endTime);

    if (overlapStart < overlapEnd) {
      const overlapDuration = overlapEnd - overlapStart;
      const percentageOverlap = (overlapDuration / duration) * 100;
      const startPoint = ((overlapStart - start) / duration) * 100;

      results.push({
        id: item.id,
        start,
        end,
        percentageOverlap: Number(percentageOverlap.toFixed(2)),
        targetLang: item.targetLang,
        startPoint: Number(startPoint.toFixed(2)),
        vocab: item?.vocab ?? [
          { surfaceForm: item.targetLang, meaning: 'n/a' },
        ],
      });
    }
  });

  if (refSeconds) {
    refSeconds.current = threeSecondLoopState;
  }

  if (results?.length > 0) {
    if (setState) {
      setState(results);
    } else {
      return results;
    }
  }
};

const useManageThreeSecondLoopLegacy = ({
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  setOverlappingSnippetDataState,
  overlappingSnippetDataState,
  mediaDuration,
}: {
  threeSecondLoopState: number | null;
  contractThreeSecondLoopState: boolean;
  formattedTranscriptState: any[];
  setOverlappingSnippetDataState: (data: OverlappingSnippetData[]) => void;
  overlappingSnippetDataState: OverlappingSnippetData[];
  mediaDuration?: number;
}) => {
  const refSeconds = useRef<number | null>(null);
  const prevContractThreeSecondLoopState = useRef(contractThreeSecondLoopState);

  useEffect(() => {
    if (!threeSecondLoopState && overlappingSnippetDataState?.length > 0) {
      setOverlappingSnippetDataState([]);
    }
    if (!formattedTranscriptState || formattedTranscriptState.length === 0)
      return;

    const threeSecondChanged =
      isNumber(threeSecondLoopState) &&
      refSeconds.current !== threeSecondLoopState;

    const contractChanged =
      prevContractThreeSecondLoopState.current !== contractThreeSecondLoopState;

    if (threeSecondChanged || contractChanged) {
      const startTime =
        threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
      const endTime =
        threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

      threeSecondLoopLogicLegacy({
        refSeconds,
        threeSecondLoopState,
        formattedTranscriptState,
        setState: setOverlappingSnippetDataState,
        startTime,
        endTime,
        mediaDuration,
      });
    }

    prevContractThreeSecondLoopState.current = contractThreeSecondLoopState;
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState,
    mediaDuration,
  ]);
};

export default useManageThreeSecondLoopLegacy;
