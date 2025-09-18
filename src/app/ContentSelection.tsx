import { useEffect, useState } from 'react';
import clsx from 'clsx';
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
        const isSelected = thisContentMetaData.isSelected;
        const sentencesNeedReview = thisContentMetaData.sentencesNeedReview;
        const hasBeenReviewed = thisContentMetaData.hasBeenReviewed;

        return (
          <Button
            key={chapterNum}
            variant='outline'
            className={clsx(
              hasBeenReviewed ? 'bg-green-200' : '',
              isSelected ? 'border-black border-2' : '',
              'relative p-5',
            )}
            onClick={() => handleSelectedContent(title)}
          >
            {chapterNum}{' '}
            {sentencesNeedReview > 0 && (
              <span
                className='italic absolute left-2/3 top-1/10'
                style={{
                  fontSize: 10,
                }}
              >
                ({sentencesNeedReview})
              </span>
            )}
          </Button>
        );
      })}
    </ul>
  );
};

const ContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
}) => {
  const { getYoutubeID, handleSelectInitialTopic, checkTopicNeedsReviewBool } =
    useData();

  const [contentSelectionState, setContentSelectionState] = useState([]);

  useEffect(() => {
    if (generalTopicDisplayNameState) {
      const comprehensiveState = generalTopicDisplayNameState
        .map((youtubeTag) => {
          const youtubeId = getYoutubeID(youtubeTag);
          const isThisDue = checkTopicNeedsReviewBool(youtubeTag);

          return {
            youtubeTag,
            youtubeId,
            isThisDue,
          };
        })
        .sort((a, b) => {
          return a.isThisDue === b.isThisDue ? 0 : a.isThisDue ? -1 : 1;
        });

      setContentSelectionState(comprehensiveState);
    }
  }, [
    generalTopicDisplayNameSelectedState,
    checkTopicNeedsReviewBool,
    getYoutubeID,
    generalTopicDisplayNameState,
  ]);

  return (
    <>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!generalTopicDisplayNameSelectedState &&
          contentSelectionState?.length > 0 &&
          contentSelectionState.map((youtubeMetaData, index) => {
            const youtubeTag = youtubeMetaData.youtubeTag;
            const youtubeId = youtubeMetaData.youtubeId;
            const isThisDue = youtubeMetaData.isThisDue;

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
                  onClick={() => handleSelectInitialTopic(youtubeTag)}
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
    </>
  );
};

export default ContentSelection;
