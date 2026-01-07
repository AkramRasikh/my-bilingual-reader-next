import { isNumber } from '@/utils/is-number';
import { useMemo, useRef } from 'react';
import { OverlappingSnippetData } from '@/app/types/shared-types';

const useManageThreeSecondLoopMemo = ({
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  isRealEndTime,
}: {
  threeSecondLoopState: number | null;
  contractThreeSecondLoopState: boolean;
  formattedTranscriptState: any[];
  isRealEndTime?: number;
}) => {
  const refSeconds = useRef<number | null>(null);
  const prevContractThreeSecondLoopState = useRef(contractThreeSecondLoopState);

  return useMemo(() => {
    const results: OverlappingSnippetData[] = [];
    if (!threeSecondLoopState) {
      return [];
    }
    if (!formattedTranscriptState || formattedTranscriptState.length === 0) {
      return [];
    }

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

      formattedTranscriptState.forEach((item, index) => {
        const start = item.time;
        const end = item?.nextSentence
          ? item.nextSentence
          : isRealEndTime
          ? isRealEndTime
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
          });
        }
      });

      refSeconds.current = threeSecondLoopState;

      return results;
    }
    prevContractThreeSecondLoopState.current = contractThreeSecondLoopState;
    return results;
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState,
    isRealEndTime,
  ]);
};

export default useManageThreeSecondLoopMemo;
