import { useMemo } from 'react';

const useTrackMasterTranscript = ({ masterPlay, formattedTranscriptState }) => {
  const masterPlayComprehensive = useMemo(() => {
    return formattedTranscriptState?.find((x) => x.id === masterPlay);
  }, [masterPlay, formattedTranscriptState]);

  return masterPlayComprehensive;
};

export default useTrackMasterTranscript;
