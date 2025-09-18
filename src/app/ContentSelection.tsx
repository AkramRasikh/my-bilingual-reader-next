import clsx from 'clsx';
import { getGeneralTopicName } from './get-general-topic-name';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useData from './useData';

export const ContentSectionsForReciew = () => {
  const {
    checkHowManyOfTopicNeedsReview,
    handleGetComprehensiveReview,
    generalTopicDisplayNameSelectedState,
    handleSelectedContent,
  } = useData();

  const theseSentencesDue =
    generalTopicDisplayNameSelectedState && checkHowManyOfTopicNeedsReview();

  const hasReviewSentences = theseSentencesDue?.length > 0;

  const topicsWithReviews = hasReviewSentences
    ? theseSentencesDue.reduce((acc, item) => {
        if (item.title) {
          acc[item.title] = (acc[item.title] || 0) + 1;
        }
        return acc;
      }, {})
    : [];
  return hasReviewSentences > 0 ? (
    <ul className='flex flex-col flex-wrap gap-1'>
      {Object.entries(topicsWithReviews).map(([title, count]) => {
        const chapter = title.split('-');
        const chapterNum = chapter[chapter.length - 1];
        return (
          <Button key={title} onClick={() => handleSelectedContent(title)}>
            {chapterNum} ({count})
          </Button>
        );
      })}
      <Button variant='outline' onClick={handleGetComprehensiveReview}>
        All {theseSentencesDue?.length}
      </Button>
    </ul>
  ) : null;
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
