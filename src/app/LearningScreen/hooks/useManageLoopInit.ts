import { isNumber } from '@/utils/is-number';
import { useEffect } from 'react';

const useManageLoopInit = ({
  ref,
  threeSecondLoopState,
  contractThreeSecondLoopState,
  loopTranscriptState,
  setContractThreeSecondLoopState,
  masterPlay,
}) => {
  // Handle three-second loop boundary checking
  useEffect(() => {
    if (!ref.current || !isNumber(threeSecondLoopState)) return;

    const video = ref.current;
    const startTime =
      threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
    const endTime =
      threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (currentTime < startTime || currentTime > endTime) {
        video.currentTime = startTime;
        video.play();
      }
    };

    // Initial check and play
    handleTimeUpdate();

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [threeSecondLoopState, contractThreeSecondLoopState]);

  // Handle transcript loop
  useEffect(() => {
    if (!ref.current || !loopTranscriptState?.length) return;

    const loopTranscriptIds = loopTranscriptState.map((item) => item?.id);
    const firstLoopScript = loopTranscriptState[0];

    if (!loopTranscriptIds.includes(masterPlay)) {
      ref.current.currentTime = firstLoopScript.time;
      ref.current.play();
    }
  }, [loopTranscriptState, masterPlay]);

  // Reset contract state when three-second loop ends
  useEffect(() => {
    if (contractThreeSecondLoopState && !threeSecondLoopState) {
      setContractThreeSecondLoopState(false);
    }
  }, [
    contractThreeSecondLoopState,
    threeSecondLoopState,
    setContractThreeSecondLoopState,
  ]);
};

export default useManageLoopInit;
