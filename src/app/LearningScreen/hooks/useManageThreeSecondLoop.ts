import { isNumber } from '@/utils/is-number';
import { useEffect, useRef } from 'react';

export const threeSecondLoopLogic = ({
  refSeconds,
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  realStartTime,
  setState,
}) => {
  const startTime =
    threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
  const endTime =
    threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

  const results = [];

  formattedTranscriptState.forEach((item, index) => {
    const start = item.time + realStartTime;
    const end =
      index < formattedTranscriptState.length - 1
        ? formattedTranscriptState[index + 1].time + realStartTime
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
        startPoint: Number(startPoint.toFixed(2)),
      });
    }
  });

  refSeconds.current = threeSecondLoopState;
  if (results?.length > 0) {
    if (setState) {
      setState(results);
    } else {
      return results;
    }
  }
};

const useManageThreeSecondLoop = ({
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  realStartTime,
  setOverlappingSnippetDataState,
  overlappingSnippetDataState,
}) => {
  const refSeconds = useRef<number | null>(null);
  const prevContractThreeSecondLoopState = useRef(contractThreeSecondLoopState);

  useEffect(() => {
    if (!formattedTranscriptState || formattedTranscriptState.length === 0)
      return;

    if (!threeSecondLoopState && overlappingSnippetDataState?.length > 0) {
      setOverlappingSnippetDataState([]);
    }

    const threeSecondChanged =
      isNumber(threeSecondLoopState) &&
      refSeconds.current !== threeSecondLoopState;

    const contractChanged =
      prevContractThreeSecondLoopState.current !== contractThreeSecondLoopState;

    if (threeSecondChanged || contractChanged) {
      threeSecondLoopLogic({
        refSeconds,
        threeSecondLoopState,
        contractThreeSecondLoopState,
        formattedTranscriptState,
        realStartTime,
        setState: setOverlappingSnippetDataState,
      });
    }

    prevContractThreeSecondLoopState.current = contractThreeSecondLoopState;
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    realStartTime,
    formattedTranscriptState,
  ]);
};

export default useManageThreeSecondLoop;
