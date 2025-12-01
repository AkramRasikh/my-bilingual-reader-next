'use client';
import LandingUIContentSelection from './LandingUIContentSelection';
import MockFlag from '../../components/custom/MockFlag';
import { useLandingScreen } from '../Providers/LandingScreenProvider';
import LandingUIBreadCrumb from './LandingUIBreadCrumb';
import LandingUILegacyContent from './LandingUILegacyContent';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const { generalTopicDisplayNameMemoized, hasScheduledForDeletion } =
    useLandingScreen();

  return (
    <div>
      <LandingUIBreadCrumb />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection
        generalTopicDisplayNameMemoized={generalTopicDisplayNameMemoized}
      />
      {hasScheduledForDeletion && <LandingUILegacyContent />}
    </div>
  );
};

export default LandingScreen;
