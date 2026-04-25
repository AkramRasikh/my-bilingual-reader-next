'use client';
import { useEffect, useMemo } from 'react';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import MockFlag from '../../components/custom/MockFlag';
import LearningScreenBreadCrumbHeader from '../LearningScreen/LearningScreenBreadCrumbHeader';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import LearningScreen from '../LearningScreen';
import PageContainer from '@/components/custom/PageContainer';
import PageContainerErrorBanner from '@/components/custom/PageContainerErrorBanner';
import { LanguageEnum } from '../languages';

export const ContentScreenContainer = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    toastMessageState,
    setToastMessageState,
    contentState,
    hasFetchedDataState,
    hasFetchInitErrorState,
    languageSelectedState,
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
    return <LoadingSpinner big />;
  }

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <LearningScreenBreadCrumbHeader />
      {isMockEnv && <MockFlag />}
      <LearningScreen />
    </PageContainer>
  );
};

const ContentScreen = () => {
  const searchParams = useSearchParams();
  const titleParam = searchParams.get('topic');
  const languageParam = searchParams.get('language') as LanguageEnum | null;
  const {
    contentState,
    hasFetchedDataState,
    hasFetchInitErrorState,
    languageSelectedState,
    toastMessageState,
    setToastMessageState,
    setLanguageSelectedState,
  } = useFetchData();

  useEffect(() => {
    if (!languageParam || languageParam === languageSelectedState) {
      return;
    }

    localStorage.setItem('selectedLanguage', languageParam);
    setLanguageSelectedState(languageParam);
  }, [languageParam, languageSelectedState, setLanguageSelectedState]);

  const selectedContentStateMemoized = useMemo(() => {
    const thisContent = contentState.find((item) => item.title === titleParam);
    if (thisContent) {
      return thisContent;
    }
    return null;
  }, [contentState, titleParam]);

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

  if (
    !hasFetchedDataState ||
    !contentState?.length ||
    !languageSelectedState ||
    !selectedContentStateMemoized
  ) {
    return <LoadingSpinner big />;
  }
  return (
    <LearningScreenProvider
      selectedContentStateMemoized={selectedContentStateMemoized}
    >
      <ContentScreenContainer />
    </LearningScreenProvider>
  );
};

export default ContentScreen;
