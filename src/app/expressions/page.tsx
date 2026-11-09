'use client';

import { useRouter } from 'next/navigation';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import PageContainer from '@/components/custom/PageContainer';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import ExpressionsWorkspace from './ExpressionsWorkspace';

export default function ExpressionsPage() {
  const router = useRouter();
  const {
    toastMessageState,
    setToastMessageState,
    wordsState,
    wordsForReviewMemoized,
    hasFetchedDataState,
    hasFetchInitErrorState,
    languageSelectedState,
  } = useFetchData();

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <BreadCrumbHeaderBase
        onClick={() => router.push('/')}
        heading='Home'
        subHeading='Expressions'
      />
      <ExpressionsWorkspace
        dueWords={wordsForReviewMemoized}
        words={wordsState}
        wordsReady={hasFetchedDataState || hasFetchInitErrorState}
        language={languageSelectedState}
      />
    </PageContainer>
  );
}
