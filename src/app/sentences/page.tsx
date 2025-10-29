'use client';

import PageContainer from '@/components/custom/PageContainer';
import { DataProvider } from '../Providers/DataProvider';
import {
  FetchDataProvider,
  useFetchData,
} from '../Providers/FetchDataProvider';
import SentencesUIContainer from './SentencesUIContainer';
import { SentencesUIProvider } from './SentencesUIProvider';
import SentencesUIBreadCrumbHeader from './SentencesUIBreadCrumbHeader';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const SentencePageContent = () => {
  const { data, languageSelectedState } = useFetchData();

  if (!data || !languageSelectedState)
    return (
      <PageContainer>
        <LoadingSpinner big />
      </PageContainer>
    );
  const { wordsData, sentencesData, contentData } = data;

  return (
    <PageContainer>
      <DataProvider
        wordsData={wordsData}
        sentencesData={sentencesData}
        contentData={contentData}
        languageSelectedState={languageSelectedState}
      >
        <SentencesUIProvider>
          <SentencesUIBreadCrumbHeader />
          <SentencesUIContainer />
        </SentencesUIProvider>
      </DataProvider>
    </PageContainer>
  );
};

export default function SentencesPage() {
  return <SentencePageContent />;
}
