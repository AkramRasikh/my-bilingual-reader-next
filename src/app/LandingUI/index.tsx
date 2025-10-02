'use client';
import { useEffect, useState } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../useData';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import SentenceReviewContainer from '../SentenceReviewContainer';
import LandingScreenSpinner from './LandingScreenSpinner';
import MockFlag from '../../components/custom/MockFlag';
import useLandingScreenLoadGeneralTopicsDisplay from './useLandingUILoadGeneralTopicsDisplay';
import BreadcrumbComponent from '../BreadCrumbHeader';
import LoadingSpinner from '@/components/custom/LoadingSpinner';

const LandingScreen = () => {
  const [isLoadingState, setIsLoadingState] = useState(false);

  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    generalTopicDisplayNameState,
    generalTopicDisplayNameSelectedState,
    sentencesState,
    toastMessageState,
    setToastMessageState,
    isSentenceReviewState,
    setIsSentenceReviewState,
  } = useData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  useLandingScreenLoadGeneralTopicsDisplay({ setIsLoadingState });

  const numberOfSentences = sentencesState.length;

  if (isSentenceReviewState && sentencesState.length > 0) {
    return <SentenceReviewContainer />;
  }

  return (
    <LearningScreenProvider>
      <BreadcrumbComponent />
      {isMockEnv && <MockFlag />}
      {isLoadingState && <LoadingSpinner big />}
      <LandingUIContentSelection
        generalTopicDisplayNameSelectedState={
          generalTopicDisplayNameSelectedState
        }
        generalTopicDisplayNameState={generalTopicDisplayNameState}
        isSentenceReviewState={isSentenceReviewState}
        setIsSentenceReviewState={setIsSentenceReviewState}
        numberOfSentences={numberOfSentences}
      />
      <LearningScreen />
    </LearningScreenProvider>
  );
};

export default LandingScreen;
