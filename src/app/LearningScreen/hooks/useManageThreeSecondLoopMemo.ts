import { useMemo } from 'react';
import { getSecondsLoopedTranscriptData } from '../utils/get-seconds-looped-transcript-data';

const useManageThreeSecondLoopMemo = ({
  threeSecondLoopState,
  contractThreeSecondLoopState,
  formattedTranscriptState,
  mediaDuration,
}: {
  threeSecondLoopState: number | null;
  contractThreeSecondLoopState: boolean;
  formattedTranscriptState: any[];
  mediaDuration: number | null;
}) => {
  return useMemo(() => {
    if (!threeSecondLoopState || !mediaDuration) {
      return [];
    }
    if (!formattedTranscriptState || formattedTranscriptState.length === 0) {
      return [];
    }

    const loopStartTime =
      threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
    const loopEndTime =
      threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

    return getSecondsLoopedTranscriptData({
      formattedTranscriptState,
      loopStartTime,
      loopEndTime,
      mediaDuration,
    });
  }, [
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState,
    mediaDuration,
  ]);
};

export default useManageThreeSecondLoopMemo;
