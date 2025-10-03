'use client';

import LoadingSpinner from '@/components/custom/LoadingSpinner';

import { useFetchData } from './FetchDataProvider';
import LandingUI from './LandingUI';
import { DataProvider } from './Providers/DataProvider';

const PageBaseContent = () => {
  const { data } = useFetchData();

  if (!data) return <LoadingSpinner big />;

  const { wordsData, sentencesData, contentData } = data;
  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <DataProvider
        wordsData={wordsData}
        sentencesData={sentencesData}
        contentData={contentData}
      >
        <LandingUI />
      </DataProvider>
    </div>
  );
};

export default PageBaseContent;
