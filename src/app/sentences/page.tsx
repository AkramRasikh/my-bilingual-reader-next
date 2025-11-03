'use client';

import PageContainer from '@/components/custom/PageContainer';
import { useFetchData } from '../Providers/FetchDataProvider';
import SentencesUIContainer from './SentencesUIContainer';
import { SentencesUIProvider } from './SentencesUIProvider';
import SentencesUIBreadCrumbHeader from './SentencesUIBreadCrumbHeader';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const SentencePageContent = () => {
  const {
    sentencesState,
    languageSelectedState,
    toastMessageState,
    setToastMessageState,
  } = useFetchData();

  if (!sentencesState || !languageSelectedState)
    return (
      <PageContainer
        toastMessageState={toastMessageState}
        setToastMessageState={setToastMessageState}
      >
        <LoadingSpinner big />
      </PageContainer>
    );

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <SentencesUIProvider>
        <SentencesUIBreadCrumbHeader />
        <SentencesUIContainer />
      </SentencesUIProvider>
    </PageContainer>
  );
};

export default function SentencesPage() {
  return <SentencePageContent />;
}
