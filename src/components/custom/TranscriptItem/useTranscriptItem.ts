import { useContext } from 'react';
import {
  TranscriptItemContext,
  TranscriptItemContextType,
} from './TranscriptItemProvider';

const useTranscriptItem = (): TranscriptItemContextType => {
  const context = useContext(TranscriptItemContext);

  if (!context)
    throw new Error(
      'useTranscriptItem must be used within a TranscriptItemProvider',
    );

  return context;
};

export default useTranscriptItem;
