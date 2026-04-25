'use client';

import PageContainer from '@/components/custom/PageContainer';
import { useFetchData } from '../Providers/FetchDataProvider';
import LandingNew from '.';
import { LandingNewProvider } from './Provider/LandingNewProvider';

const LandingNewContainer = () => {
  const { toastMessageState, setToastMessageState } = useFetchData();

  return (
    <PageContainer
      toastMessageState={toastMessageState}
      setToastMessageState={setToastMessageState}
    >
      <LandingNewProvider>
        <LandingNew />
      </LandingNewProvider>
    </PageContainer>
  );
};

export default LandingNewContainer;
