'use client';
import { useEffect } from 'react';
import LearningScreen from '../LearningScreen';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import MockFlag from '../../components/custom/MockFlag';
import BreadcrumbComponent from '../../components/custom/BreadCrumbHeader';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useLandingScreen } from '../Providers/LandingScreenProvider';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const { generalTopicDisplayNameMemoized } = useLandingScreen();
  const { toastMessageState, setToastMessageState } = useFetchData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  return (
    <LearningScreenProvider>
      <BreadcrumbComponent />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection
        generalTopicDisplayNameMemoized={generalTopicDisplayNameMemoized}
      />
      <LearningScreen />
    </LearningScreenProvider>
  );
};

export default LandingScreen;
