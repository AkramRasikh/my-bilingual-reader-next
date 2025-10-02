'use client';

import { DataProvider } from './DataProvider';
import { useFetchData } from './FetchDataProvider';
import LandingUI from './LandingUI';

const PageBaseContent = () => {
  const { data } = useFetchData();

  if (!data) return <p>Loading...</p>;

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
