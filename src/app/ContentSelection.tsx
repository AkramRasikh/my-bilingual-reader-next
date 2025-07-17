import clsx from 'clsx';
import { getGeneralTopicName } from './get-general-topic-name';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useData from './useData';

const ContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
  setGeneralTopicDisplayNameSelectedState,
  selectedContentState,
  youtubeContentTagsState,
  handleSelectedContent,
}) => {
  const { getYoutubeID } = useData();
  return (
    <>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!generalTopicDisplayNameSelectedState &&
          generalTopicDisplayNameState?.length > 0 &&
          generalTopicDisplayNameState.map((youtubeTag, index) => {
            const youtubeId = getYoutubeID(youtubeTag);

            return (
              <li key={index}>
                <Image
                  width={200}
                  height={200}
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={youtubeId}
                  className='m-auto pb-1'
                />

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
