'use client';

import PageContainer from '@/components/custom/PageContainer';
import { DataProvider } from '../Providers/DataProvider';
import { useFetchData } from '../Providers/FetchDataProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUIBreadCrumbHeader from '../WordsStudyUI/WordsStudyUIBreadCrumbHeader';
import { Toaster } from 'sonner';
import WordsStudyUI from '../WordsStudyUI';

const WordStudyPageContent = () => {
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
        <WordsStudyUIProvider>
          <Toaster position='top-center' />
          <WordsStudyUIBreadCrumbHeader />
          <WordsStudyUI />
        </WordsStudyUIProvider>
      </DataProvider>
    </PageContainer>
  );
};
export default function WordsStudyPage() {
  return <WordStudyPageContent />;
}
