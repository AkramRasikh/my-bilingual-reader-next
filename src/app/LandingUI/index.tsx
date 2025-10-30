'use client';
import { useEffect } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../Providers/useData';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import MockFlag from '../../components/custom/MockFlag';
import BreadcrumbComponent from '../../components/custom/BreadCrumbHeader';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    generalTopicDisplayNameMemoized,
    generalTopicDisplayNameSelectedState,
    sentencesState,
    toastMessageState,
    setToastMessageState,
  } = useData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  const numberOfSentences = sentencesState.length;

  return (
    <LearningScreenProvider>
      <BreadcrumbComponent />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection
        generalTopicDisplayNameSelectedState={
          generalTopicDisplayNameSelectedState
        }
        generalTopicDisplayNameMemoized={generalTopicDisplayNameMemoized}
        numberOfSentences={numberOfSentences}
      />
      <LearningScreen />
    </LearningScreenProvider>
  );
};

export default LandingScreen;
