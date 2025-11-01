'use client';

import PageContainer from '@/components/custom/PageContainer';

import { useFetchData } from '../Providers/FetchDataProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUIBreadCrumbHeader from '../WordsStudyUI/WordsStudyUIBreadCrumbHeader';
import { Toaster } from 'sonner';
import WordsStudyUI from '../WordsStudyUI';

const WordStudyPageContent = () => {
  const { wordsState, languageSelectedState } = useFetchData();

  if (!wordsState || !languageSelectedState)
    return (
      <PageContainer>
        <LoadingSpinner big />
      </PageContainer>
    );

  return (
    <PageContainer>
      <WordsStudyUIProvider>
        <Toaster position='top-center' />
        <WordsStudyUIBreadCrumbHeader />
        <WordsStudyUI />
      </WordsStudyUIProvider>
    </PageContainer>
  );
};
export default function WordsStudyPage() {
  return <WordStudyPageContent />;
}
