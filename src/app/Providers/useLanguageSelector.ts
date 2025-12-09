import { useEffect, useState } from 'react';
import { LanguageEnum } from '../languages';
import { FetchDataContextTypes } from './FetchDataProvider';

interface UseLanguageSelectorTypes {
  languageSelectedState: FetchDataContextTypes['languageSelectedState'];
  setLanguageSelectedState: FetchDataContextTypes['setLanguageSelectedState'];
}

const useLanguageSelector = ({
  languageSelectedState,
  setLanguageSelectedState,
}: UseLanguageSelectorTypes) => {
  const [languageOnMountState, setLanguageOnMountState] =
    useState<LanguageEnum>(LanguageEnum.None);

  useEffect(() => {
    const selectedLanguage = localStorage.getItem(
      'selectedLanguage',
    ) as LanguageEnum | null;
    setLanguageSelectedState(selectedLanguage ?? LanguageEnum.Japanese);
  }, []);

  useEffect(() => {
    if (languageSelectedState) {
      localStorage.setItem('selectedLanguage', languageSelectedState);
    }

    if (!languageOnMountState && languageSelectedState) {
      setLanguageOnMountState(languageSelectedState);
    }
    if (
      languageOnMountState &&
      languageSelectedState &&
      languageOnMountState !== languageSelectedState
    ) {
      window.location.reload();
    }
  }, [languageSelectedState, languageOnMountState]);
};

export default useLanguageSelector;
