'use client';
import { createContext } from 'react';

export const LearningScreenContext = createContext(null);

export const LearningScreenProvider = ({
  handlePlayFromHere,
  handleTimeUpdate,
  ref,
  currentTime,
  children,
}: PropsWithChildren<object>) => {
  return (
    <LearningScreenContext.Provider
      value={{
        handlePlayFromHere,
        handleTimeUpdate,
        ref,
        currentTime,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
