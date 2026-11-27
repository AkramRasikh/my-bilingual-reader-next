import { isNumber } from '@/utils/is-number';
import { useEffect } from 'react';

const useManageLoopInit = ({
  ref,
  threeSecondLoopState,
  contractThreeSecondLoopState,
  loopTranscriptState,
  setContractThreeSecondLoopState,
  masterPlay,
  rangeLoopState = null,
}: {
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  threeSecondLoopState: number | null;
  contractThreeSecondLoopState: boolean;
  loopTranscriptState: { id: string; time: number }[];
  setContractThreeSecondLoopState: (value: boolean) => void;
  masterPlay: string;
  rangeLoopState?: { start: number; end: number } | null;
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

  // Handle the clip range loop (custom sentence snippets): loop start..end
  // exactly, enforced the same way as the 3 s loop.
  useEffect(() => {
    if (!ref.current || !rangeLoopState) return;

    const video = ref.current;
    const { start, end } = rangeLoopState;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (currentTime < start || currentTime > end) {
        video.currentTime = start;
        video.play();
      }
    };

    handleTimeUpdate();

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [rangeLoopState?.start, rangeLoopState?.end]);

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
