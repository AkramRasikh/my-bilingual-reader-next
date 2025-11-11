'use client';
import { useEffect } from 'react';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import MockFlag from '../../components/custom/MockFlag';
import LearningScreenBreadCrumbHeader from '../LearningScreen/LearningScreenBreadCrumbHeader';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import useLearningScreen from '../LearningScreen/useLearningScreen';
import LearningScreen from '../LearningScreen';
import PageContainer from '@/components/custom/PageContainer';

const ContentScreenContainer = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    toastMessageState,
    setToastMessageState,
    contentState,
    hasFetchedDataState,
    languageSelectedState,
  } = useFetchData();

  const {
    selectedContentTitleState,
    setSelectedContentTitleState,
    setGeneralTopicDisplayNameSelectedState,
  } = useLearningScreen();

  const searchParams = useSearchParams();
  const topicValue = searchParams.get('topic');

  useEffect(() => {
    if (topicValue && !selectedContentTitleState && contentState?.length > 0) {
      const thisSelectedTopicViaParam = contentState.find(
        (item) => item.generalTopicName === topicValue,
      )?.title;
      setGeneralTopicDisplayNameSelectedState(topicValue);
      setSelectedContentTitleState(thisSelectedTopicViaParam);
    }
  }, [topicValue, selectedContentTitleState, contentState]);

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

const ContentScreen = () => (
  <LearningScreenProvider>
    <ContentScreenContainer />
  </LearningScreenProvider>
);

export default ContentScreen;
