'use client';

import PageContainer from '@/components/custom/PageContainer';

import { useFetchData } from '../Providers/FetchDataProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUIBreadCrumbHeader from '../WordsStudyUI/WordsStudyUIBreadCrumbHeader';
import WordsStudyUI from '../WordsStudyUI';

const WordStudyPageContent = () => {
  const {
    wordsState,
    languageSelectedState,
    toastMessageState,
    setToastMessageState,
  } = useFetchData();

  if (!wordsState || !languageSelectedState)
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
      <WordsStudyUIProvider>
        <WordsStudyUIBreadCrumbHeader />
        <WordsStudyUI />
      </WordsStudyUIProvider>
    </PageContainer>
  );
};
export default function WordsStudyPage() {
  return <WordStudyPageContent />;
}
