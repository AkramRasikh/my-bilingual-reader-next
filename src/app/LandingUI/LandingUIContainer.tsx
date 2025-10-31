'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUI from '.';
import { DataProvider } from '../Providers/DataProvider';

const LandingUIContainer = () => {
  const { contentState, hasFetchedDataState, languageSelectedState } =
    useFetchData();

  if (!hasFetchedDataState || !contentState?.length || !languageSelectedState) {
    return <LoadingSpinner big />;
  }

  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <DataProvider>
        <LandingUI />
      </DataProvider>
    </div>
  );
};

export default LandingUIContainer;
