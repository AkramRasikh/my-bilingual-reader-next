'use client';

import PageContainer from '@/components/custom/PageContainer';
import { DataProvider } from '../Providers/DataProvider';
import { useFetchData } from '../Providers/FetchDataProvider';
import SentenceReviewContainer from './SentencesUIContainer';

export default function SentencesPage() {
  const { data, languageSelectedState } = useFetchData();

  if (!data || !languageSelectedState) return <p>Loading...</p>;
  const { wordsData, sentencesData, contentData } = data;

  return (
    <PageContainer>
      <DataProvider
        wordsData={wordsData}
        sentencesData={sentencesData}
        contentData={contentData}
      >
        <SentenceReviewContainer />
      </DataProvider>
    </PageContainer>
  );
}
