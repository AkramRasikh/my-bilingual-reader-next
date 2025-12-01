import { useFetchData } from '../Providers/FetchDataProvider';
import LandingUICheckLiveStatus from './LandingUICheckLiveStatus';

const LandingUILegacyContent = () => {
  const { nonMediaGeneralTopicDisplayNameMemoized } = useFetchData();
  return (
    <div>
      <ul>
        {nonMediaGeneralTopicDisplayNameMemoized?.map((item, index) => {
          return (
            <li key={index}>
              <span>
                {item.title} ({item?.subSections?.length})
              </span>
              <div className='pl-5'>
                {item?.subSections.map((subsection, indexNested) => {
                  return (
                    <LandingUICheckLiveStatus
                      key={indexNested}
                      subsection={subsection}
                    />
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LandingUILegacyContent;
