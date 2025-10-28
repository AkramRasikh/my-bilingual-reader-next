'use client';
import { createContext, useRef, useContext } from 'react';

const SentencesUIContext = createContext(null);

export const SentencesUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef(null);

  return (
    <SentencesUIContext.Provider
      value={{
        ref,
        transcriptRef,
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
