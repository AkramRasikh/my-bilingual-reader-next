import { mapSentenceIdsToSeconds } from '@/app/map-sentence-ids-to-seconds';
import { useEffect } from 'react';

const useMapTranscriptToSeconds = ({
  ref,
  content,
  realStartTime,
  secondsState,
  setSecondsState,
}) => {
  useEffect(() => {
    if (!ref.current?.duration || secondsState?.length > 0) {
      return;
    }

    const arrOfSeconds = mapSentenceIdsToSeconds({
      content,
      duration: ref.current?.duration,
      isVideoModeState: true,
      realStartTime,
    });

    setSecondsState(arrOfSeconds);
  }, [ref.current, secondsState, content, realStartTime]);
};

export default useMapTranscriptToSeconds;
