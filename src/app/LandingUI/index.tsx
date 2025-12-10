'use client';
import LandingUIContentSelection from './LandingUIContentSelection';
import MockFlag from '../../components/custom/MockFlag';
import LandingUIBreadCrumb from './LandingUIBreadCrumb';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  return (
    <div>
      <LandingUIBreadCrumb />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection />
    </div>
  );
};

export default LandingScreen;
