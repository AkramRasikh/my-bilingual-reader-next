'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUI from '.';
import PageContainer from '@/components/custom/PageContainer';
import PageContainerErrorBanner from '@/components/custom/PageContainerErrorBanner';
import { LandingUIProvider } from './Provider/LandingUIProvider';

const LandingUIContainer = () => {
  const {
    contentState,
    hasFetchedDataState,
    hasFetchInitErrorState,
    languageSelectedState,
    toastMessageState,
    setToastMessageState,
  } = useFetchData();

  if (hasFetchInitErrorState) {
    return (
      <PageContainer
        toastMessageState={toastMessageState}
        setToastMessageState={setToastMessageState}
      >
        <PageContainerErrorBanner />
      </PageContainer>
    );
  }

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
      <LandingUIProvider>
        <LandingUI />
      </LandingUIProvider>
    </PageContainer>
  );
};

export default LandingUIContainer;
