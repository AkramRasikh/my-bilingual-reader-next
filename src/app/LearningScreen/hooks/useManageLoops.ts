import { isNumber } from '@/utils/is-number';
import { useEffect } from 'react';

const useManageLoops = ({
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  realStartTime,
  setOverlappingSnippetDataState,
}) => {
  useEffect(() => {
    if (isNumber(threeSecondLoopState)) {
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
            ...item,
            start,
            end,
            percentageOverlap: Number(percentageOverlap.toFixed(2)),
            startPoint: Number(startPoint.toFixed(2)),
          });
        }
      });

      if (results?.length > 0) {
        setOverlappingSnippetDataState(results);
      }
    }
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    realStartTime,
    formattedTranscriptState,
  ]);
};

export default useManageLoops;
