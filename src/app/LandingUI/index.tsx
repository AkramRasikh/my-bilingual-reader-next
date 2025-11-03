'use client';
import LandingUIContentSelection from './LandingUIContentSelection';
import MockFlag from '../../components/custom/MockFlag';
import { useLandingScreen } from '../Providers/LandingScreenProvider';
import LandingUIBreadCrumb from './LandingUIBreadCrumb';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const { generalTopicDisplayNameMemoized } = useLandingScreen();

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
