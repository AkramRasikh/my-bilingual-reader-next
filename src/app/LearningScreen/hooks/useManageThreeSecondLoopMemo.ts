import { isNumber } from '@/utils/is-number';
import { useMemo, useRef } from 'react';
import { getSecondsLoopedTranscriptData } from './getSecondsLoopedTranscriptData';

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

    if (!threeSecondChanged && !contractChanged) {
      return [];
    }

    const loopStartTime =
      threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
    const loopEndTime =
      threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

    prevContractThreeSecondLoopState.current = contractThreeSecondLoopState;
    refSeconds.current = threeSecondLoopState;

    return getSecondsLoopedTranscriptData({
      formattedTranscriptState,
      loopStartTime,
      loopEndTime,
      isRealEndTime,
    });
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState,
    isRealEndTime,
  ]);
};

export default useManageThreeSecondLoopMemo;
