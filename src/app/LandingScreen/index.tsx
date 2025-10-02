'use client';
import { useEffect, useState } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../useData';
import LandingScreenContentSelection from './LandingScreenContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import SentenceReviewContainer from '../SentenceReviewContainer';
import LandingScreenSpinner from './LandingScreenSpinner';
import LandingScreenMockFlag from './LandingScreenMockFlag';
import useLandingScreenLoadGeneralTopicsDisplay from './useLandingScreenLoadGeneralTopicsDisplay';
import BreadcrumbComponent from '../BreadCrumbHeader';

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
      {isMockEnv && <LandingScreenMockFlag />}
      {isLoadingState && <LandingScreenSpinner />}
      <LandingScreenContentSelection
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
