'use client';
import { createContext, useRef, useContext, useState, useEffect } from 'react';
import useData from '../Providers/useData';
import useSentencesProgress from './useSentencesProgress';

const SentencesUIContext = createContext(null);

export const SentencesUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef(null);

  const [progressState, setProgressState] = useState(0);
  const [initNumState, setInitNumState] = useState();
  const { sentencesState } = useData();

  const numberOfSentences = sentencesState.length;

  useEffect(() => {
    if (!initNumState) {
      setInitNumState(numberOfSentences);
    }
  }, [initNumState]);

  useSentencesProgress({
    setProgressState,
    initNumState,
    numberOfSentences,
  });

  const sentencesInQueue = sentencesState.slice(0, 5);

  return (
    <SentencesUIContext.Provider
      value={{
        ref,
        transcriptRef,
        sentencesInQueue,
        progressState,
        numberOfSentences,
      }}
    >
      {children}
    </SentencesUIContext.Provider>
  );
};

export const useSentencesUIScreen = () => {
  const context = useContext(SentencesUIContext);

  if (!context)
    throw new Error(
      'useSentencesUIScreen must be used within a SentencesUIScreenProvider',
    );

  return context;
};
