'use client';

import { useRouter } from 'next/navigation';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import PageContainer from '@/components/custom/PageContainer';
import PageContainerErrorBanner from '@/components/custom/PageContainerErrorBanner';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import ImprovWorkspace from './ImprovWorkspace';

export default function ImprovPage() {
  const router = useRouter();
  const {
    toastMessageState,
    setToastMessageState,
    hasFetchedDataState,
    hasFetchInitErrorState,
    languageSelectedState,
    setLanguageSelectedState,
    wordsState,
    contentState,
    sentencesState,
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

  if (!hasFetchedDataState || !languageSelectedState) {
    return <LoadingSpinner big />;
  }

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <BreadCrumbHeaderBase
        onClick={() => router.push('/')}
        heading='Home'
        subHeading='Improv'
      />
      <ImprovWorkspace
        language={languageSelectedState}
        onLanguageChange={setLanguageSelectedState}
        words={wordsState}
        contentState={contentState}
        sentencesState={sentencesState}
      />
    </PageContainer>
  );
}
