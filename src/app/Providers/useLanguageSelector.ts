import { useEffect } from 'react';
import { japanese } from '../languages';

const useLanguageSelector = ({
  languageSelectedState,
  setLanguageOnMountState,
  languageOnMountState,
  setLanguageSelectedState,
}) => {
  useEffect(() => {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    setLanguageSelectedState(selectedLanguage || japanese);
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
