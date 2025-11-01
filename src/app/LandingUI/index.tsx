'use client';
import { useEffect } from 'react';
import LandingUIContentSelection from './LandingUIContentSelection';
import { toast } from 'sonner';
import MockFlag from '../../components/custom/MockFlag';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useLandingScreen } from '../Providers/LandingScreenProvider';
import LandingUIBreadCrumb from './LandingUIBreadCrumb';

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
    <div>
      <LandingUIBreadCrumb />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection
        generalTopicDisplayNameMemoized={generalTopicDisplayNameMemoized}
      />
    </div>
  );
};

export default LandingScreen;
