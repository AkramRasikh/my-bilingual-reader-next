import { useEffect } from 'react';

const useTrackMasterTranscript = ({
  masterPlay,
  formattedTranscriptState,
  setMasterPlayComprehensiveState,
}) => {
  useEffect(() => {
    if (masterPlay && formattedTranscriptState) {
      const thisItemTranscript = formattedTranscriptState.find(
        (item) => item.id === masterPlay,
      );
      setMasterPlayComprehensiveState(thisItemTranscript);
    }
  }, [masterPlay, formattedTranscriptState]);
};

export default useTrackMasterTranscript;
