'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useFetchData } from '../../Providers/FetchDataProvider';
import {
  getLandingComprehensiveData,
  LandingComprehensiveType,
} from './getLandingComprehensiveData';

export type LandingUIComprehensiveType = LandingComprehensiveType;

export interface LandingUIProviderTypes {
  generalTopicDisplayNameMemoized: LandingUIComprehensiveType[];
}

export const LandingUIContext = createContext<LandingUIProviderTypes>({
  generalTopicDisplayNameMemoized: [],
});

type LandingUIProviderProps = {
  children: ReactNode;
};

export const LandingUIProvider = ({ children }: LandingUIProviderProps) => {
  const { contentState, wordsState } = useFetchData();

  const generalTopicDisplayNameMemoized = useMemo(() => {
    return getLandingComprehensiveData({ contentState, wordsState });
  }, [contentState, wordsState]);

  return (
    <LandingUIContext.Provider
      value={{
        generalTopicDisplayNameMemoized,
      }}
    >
      {children}
    </LandingUIContext.Provider>
  );
};

export const useLandingUI = () => {
  const context = useContext(LandingUIContext);

  if (!context)
    throw new Error('useLandingUI must be used within a LandingUIProvider');

  return context;
};
