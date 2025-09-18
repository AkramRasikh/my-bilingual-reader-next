import clsx from 'clsx';
import { getGeneralTopicName } from './get-general-topic-name';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useData from './useData';

export const ContentSectionsForReciew = () => {
  const {
    getGeneralContentMetaData,
    handleGetComprehensiveReview,
    generalTopicDisplayNameSelectedState,
    handleSelectedContent,
  } = useData();

  const contentMetaData =
    generalTopicDisplayNameSelectedState && getGeneralContentMetaData();

  return (
    <ul className='flex flex-col gap-1 overflow-y-scroll max-h-96'>
      <Button variant='outline' onClick={handleGetComprehensiveReview}>
        All
      </Button>
      {contentMetaData.map((thisContentMetaData) => {
        const chapterNum = thisContentMetaData.chapterNum;
        const title = thisContentMetaData.title;
        const sentencesNeedReview = thisContentMetaData.sentencesNeedReview;
        const hasBeenReviewed = thisContentMetaData.hasBeenReviewed;

        return (
          <Button
            key={chapterNum}
            variant='outline'
            className={clsx(hasBeenReviewed ? 'bg-green-600' : '')}
            onClick={() => handleSelectedContent(title)}
          >
            {chapterNum} <span>({sentencesNeedReview})</span>
          </Button>
        );
      })}
    </ul>
  );
};

const ContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
  setGeneralTopicDisplayNameSelectedState,
  selectedContentState,
  youtubeContentTagsState,
}) => {
  const { getYoutubeID, handleSelectedContent, checkTopicNeedsReviewBool } =
    useData();

  return (
    <>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!generalTopicDisplayNameSelectedState &&
          generalTopicDisplayNameState?.length > 0 &&
          generalTopicDisplayNameState.map((youtubeTag, index) => {
            const youtubeId = getYoutubeID(youtubeTag);
            const isThisDue = checkTopicNeedsReviewBool(youtubeTag);

            return (
              <li key={index}>
                <Image
                  width={150}
                  height={150}
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={youtubeId}
                  className='m-auto pb-1 rounded'
                />

                <Button
                  variant={'outline'}
                  onClick={() =>
                    setGeneralTopicDisplayNameSelectedState(youtubeTag)
                  }
                  className={clsx(
                    'pb-1 rounded w-full',
                    isThisDue ? 'bg-amber-500' : '',
                  )}
                >
                  <span
                    className='text-ellipsis'
                    style={{
                      overflow: 'hidden',
                      maxWidth: '15ch',
                    }}
                  >
                    {youtubeTag}
                  </span>
                </Button>
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
                  className={clsx('', reviewed && 'text-white bg-red-700')}
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
