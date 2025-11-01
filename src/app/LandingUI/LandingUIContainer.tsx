'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUI from '.';
import { LandingScreenProvider } from '../Providers/LandingScreenProvider';

const LandingUIContainer = () => {
  const { contentState, hasFetchedDataState, languageSelectedState } =
    useFetchData();

  if (!hasFetchedDataState || !contentState?.length || !languageSelectedState) {
    return <LoadingSpinner big />;
  }

  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <LandingScreenProvider>
        <LandingUI />
      </LandingScreenProvider>
    </div>
  );
};

export default LandingUIContainer;
