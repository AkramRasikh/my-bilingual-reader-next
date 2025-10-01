'use client';

import BreadcrumbComponent from './BreadCrumbHeader';
import { DataProvider } from './DataProvider';
import { useFetchData } from './FetchDataProvider';
import LandingScreen from './LandingScreen';

const PageBaseContent = () => {
  const { data } = useFetchData();

  if (!data) return <p>Loading...</p>;

  const { wordsData, sentencesData, contentData } = data;
  return (
    <DataProvider
      wordsData={wordsData}
      sentencesData={sentencesData}
      contentData={contentData}
    >
      <div className='p-4 bg-amber-50 h-lvh'>
        <BreadcrumbComponent />
        <LandingScreen />
      </div>
    </DataProvider>
  );
};

export default PageBaseContent;
