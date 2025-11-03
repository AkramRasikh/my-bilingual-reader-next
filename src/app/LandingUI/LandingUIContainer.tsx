'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUI from '.';
import { LandingScreenProvider } from '../Providers/LandingScreenProvider';
import PageContainer from '@/components/custom/PageContainer';

const LandingUIContainer = () => {
  const {
    contentState,
    hasFetchedDataState,
    languageSelectedState,
    toastMessageState,
    setToastMessageState,
  } = useFetchData();

  if (!hasFetchedDataState || !contentState?.length || !languageSelectedState) {
    return (
      <PageContainer
        toastMessageState={toastMessageState}
        setToastMessageState={setToastMessageState}
      >
        <LoadingSpinner big />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <LandingScreenProvider>
        <LandingUI />
      </LandingScreenProvider>
    </PageContainer>
  );
};

export default LandingUIContainer;
