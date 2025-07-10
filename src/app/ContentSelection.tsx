import clsx from 'clsx';
import { getGeneralTopicName } from './get-general-topic-name';
import { Button } from '@/components/ui/button';

const ContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
  setGeneralTopicDisplayNameSelectedState,
  selectedContentState,
  youtubeContentTagsState,
  handleSelectedContent,
}) => {
  return (
    <>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!generalTopicDisplayNameSelectedState &&
          generalTopicDisplayNameState?.length > 0 &&
          generalTopicDisplayNameState.map((youtubeTag, index) => {
            return (
              <li key={index}>
                <button
                  onClick={() =>
                    setGeneralTopicDisplayNameSelectedState(youtubeTag)
                  }
                  style={{
                    border: '1px solid grey',
                    padding: 3,
                    borderRadius: 5,
                  }}
                >
                  {youtubeTag}
                </button>
              </li>
            );
          })}
      </ul>
      <ul className='flex flex-wrap gap-1'>
        {!selectedContentState &&
          generalTopicDisplayNameSelectedState &&
          youtubeContentTagsState?.length > 0 &&
          youtubeContentTagsState.map((youtubeTag, index) => {
            const title = youtubeTag.title;
            const reviewed = youtubeTag.reviewed?.length > 0;
            const isPartOfGeneralList = getGeneralTopicName(title);
            if (isPartOfGeneralList !== generalTopicDisplayNameSelectedState) {
              return null;
            }

            return (
              <li key={index} className='w-fit'>
                <Button
                  variant={'outline'}
                  onClick={() => handleSelectedContent(title)}
                  className={clsx('', reviewed && 'bg-red-700')}
                >
                  {title}
                </Button>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default ContentSelection;
