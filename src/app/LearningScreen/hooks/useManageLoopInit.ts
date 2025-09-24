import { isNumber } from '@/utils/is-number';
import { useEffect } from 'react';

const useManageLoopInit = ({
  ref,
  threeSecondLoopState,
  contractThreeSecondLoopState,
  loopTranscriptState,
  setContractThreeSecondLoopState,
  masterPlay,
  progress,
}) => {
  useEffect(() => {
    // can be split into two for efficiency but fine for now
    if (!ref.current) return;
    if (isNumber(threeSecondLoopState)) {
      //
      const startTime =
        threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
      const endTime =
        threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);
      const lessThan1500Seconds = ref.current.currentTime < startTime;
      const moreThan1500Seconds = ref.current.currentTime > endTime;
      if (lessThan1500Seconds || moreThan1500Seconds) {
        ref.current.currentTime = startTime;
        ref.current.play();
        return;
      }
      return;
    }
    if (ref.current && loopTranscriptState?.length > 0) {
      const loopTranscriptIds = loopTranscriptState.map((item) => item?.id);
      const firstLoopScript = loopTranscriptState[0];
      if (!loopTranscriptIds.includes(masterPlay)) {
        ref.current.currentTime = firstLoopScript.time;
        ref.current.play();
      }
    }
    if (contractThreeSecondLoopState && !threeSecondLoopState) {
      setContractThreeSecondLoopState(false);
    }
  }, [
    loopTranscriptState,
    ref,
    masterPlay,
    contractThreeSecondLoopState,
    threeSecondLoopState,
    progress,
  ]);
};

export default useManageLoopInit;
