'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { arabic, chinese, french, japanese } from '@/app/languages';
import {
  getLandingComprehensiveDataByLanguage,
  LandingComprehensiveType,
} from '@/app/LandingUI/Provider/getLandingComprehensiveData';

export interface LandingNewProviderTypes {
  isLandingNewReady: boolean;
  languageContentMeta: {
    language: string;
    contentMeta: LandingComprehensiveType[];
  }[];
}

export const LandingNewContext = createContext<LandingNewProviderTypes>({
  isLandingNewReady: true,
  languageContentMeta: [],
});

type LandingNewProviderProps = {
  children: ReactNode;
};

export const LandingNewProvider = ({ children }: LandingNewProviderProps) => {
  const languageContentMeta = useMemo(() => {
    const supportedLanguages = [japanese, arabic, chinese, french];

    return supportedLanguages
      .map((language) => {
        return {
          language,
          contentMeta: getLandingComprehensiveDataByLanguage(language),
        };
      })
      .filter((item) => item.contentMeta.length > 0);
  }, []);

  return (
    <LandingNewContext.Provider
      value={{
        isLandingNewReady: true,
        languageContentMeta,
      }}
    >
      {children}
    </LandingNewContext.Provider>
  );
};

export const useLandingNew = () => {
  const context = useContext(LandingNewContext);

  if (!context)
    throw new Error('useLandingNew must be used within a LandingNewProvider');

  return context;
};
