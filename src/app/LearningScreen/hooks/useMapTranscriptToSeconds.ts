import { mapSentenceIdsToSeconds } from '@/app/LearningScreen/utils/map-sentence-ids-to-seconds';
import { useEffect } from 'react';

export const useLoopSecondsHook = ({
  secondsState,
  setLoopSecondsState,
  loopTranscriptState,
}) => {
  useEffect(() => {
    if (secondsState?.length > 0 && loopTranscriptState?.length > 0) {
      const loopIds = loopTranscriptState.map((item) => item.id);
      const validSeconds = secondsState.map((secondEl) =>
        loopIds.includes(secondEl) ? secondEl : '',
      );
      setLoopSecondsState(validSeconds);
    } else {
      setLoopSecondsState([]);
    }
  }, [loopTranscriptState, secondsState]);
};

const useMapTranscriptToSeconds = ({
  ref,
  content,
  setSecondsState,
  secondsState,
  setLoopSecondsState,
  loopTranscriptState,
}) => {
  useEffect(() => {
    if (secondsState?.length > 0 && loopTranscriptState?.length > 0) {
      const loopIds = loopTranscriptState.map((item) => item.id);
      const validSeconds = secondsState.map((secondEl) =>
        loopIds.includes(secondEl) ? secondEl : '',
      );
      setLoopSecondsState(validSeconds);
    } else {
      setLoopSecondsState([]);
    }
  }, [loopTranscriptState, secondsState]);

  useEffect(() => {
    if (!ref.current?.duration || secondsState?.length > 0) {
      return;
    }

    const arrOfSeconds = mapSentenceIdsToSeconds({
      content,
      duration: ref.current?.duration,
    });

    setSecondsState(arrOfSeconds);
  }, [ref.current?.duration, secondsState, content]);
};

export default useMapTranscriptToSeconds;
