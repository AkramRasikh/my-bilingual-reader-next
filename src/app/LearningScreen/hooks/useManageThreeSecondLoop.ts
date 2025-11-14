import { isNumber } from '@/utils/is-number';
import { useEffect, useRef } from 'react';

const threeSecondLoopLogic = ({
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
    setState(results);
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

  useEffect(() => {
    if (!formattedTranscriptState || formattedTranscriptState?.length === 0) {
      return;
    }
    if (!threeSecondLoopState && overlappingSnippetDataState?.length > 0) {
      setOverlappingSnippetDataState([]);
    }
    if (
      isNumber(threeSecondLoopState) &&
      refSeconds?.current !== threeSecondLoopState
    ) {
      threeSecondLoopLogic({
        refSeconds,
        threeSecondLoopState,
        contractThreeSecondLoopState,
        formattedTranscriptState,
        realStartTime,
        setState: setOverlappingSnippetDataState,
      });
    }
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    realStartTime,
    formattedTranscriptState,
  ]);
};

export default useManageThreeSecondLoop;
