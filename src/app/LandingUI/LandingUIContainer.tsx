'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUI from '.';
import PageContainer from '@/components/custom/PageContainer';
import { LandingUIProvider } from './Provider/LandingUIProvider';

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
      <LandingUIProvider>
        <LandingUI />
      </LandingUIProvider>
    </PageContainer>
  );
};

export default LandingUIContainer;
