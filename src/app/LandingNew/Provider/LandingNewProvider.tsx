'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { arabic, chinese, french, japanese } from '@/app/languages';
import { ContentStateTypes } from '@/app/reducers/content-reducer';

export interface LandingNewProviderTypes {
  isLandingNewReady: boolean;
  languageContentTitles: {
    language: string;
    titles: string[];
  }[];
}

export const LandingNewContext = createContext<LandingNewProviderTypes>({
  isLandingNewReady: true,
  languageContentTitles: [],
});

type LandingNewProviderProps = {
  children: ReactNode;
};

export const LandingNewProvider = ({ children }: LandingNewProviderProps) => {
  const languageContentTitles = useMemo(() => {
    const supportedLanguages = [japanese, arabic, chinese, french];

    return supportedLanguages
      .map((language) => {
        const localStorageContentState = localStorage.getItem(
          `${language}-contentState`,
        );
        const parsedContentState = localStorageContentState
          ? (JSON.parse(localStorageContentState) as ContentStateTypes[])
          : [];

        return {
          language,
          titles: parsedContentState
            .map((contentItem) => contentItem.title)
            .filter(Boolean),
        };
      })
      .filter((item) => item.titles.length > 0);
  }, []);

  return (
    <LandingNewContext.Provider
      value={{
        isLandingNewReady: true,
        languageContentTitles,
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
