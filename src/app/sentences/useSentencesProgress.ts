import { useEffect } from 'react';

const useSentencesProgress = ({
  setProgressState,
  initNumState,
  numberOfSentences,
}) => {
  useEffect(() => {
    if (!initNumState || !numberOfSentences) {
      return;
    }
    const progressValue =
      ((initNumState - numberOfSentences) / initNumState) * 100;

    setProgressState(progressValue);
  }, [numberOfSentences, initNumState]);
};

export default useSentencesProgress;
