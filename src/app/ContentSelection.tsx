import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import useData from './useData';
import { BookCheck } from 'lucide-react';

const ContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
}) => {
  const {
    getYoutubeID,
    handleSelectInitialTopic,
    checkTopicNeedsReviewBool,
    checkTopicIsNew,
    checkHasAllBeenReviewed,
  } = useData();

  const [contentSelectionState, setContentSelectionState] = useState([]);

  useEffect(() => {
    if (generalTopicDisplayNameState?.length > 0) {
      const comprehensiveState = generalTopicDisplayNameState.map(
        (youtubeTag) => {
          const youtubeId = getYoutubeID(youtubeTag);
          const isThisDue = checkTopicNeedsReviewBool(youtubeTag);
          const isThisNew = checkTopicIsNew(youtubeTag);
          const hasAllBeenReviewed = checkHasAllBeenReviewed(youtubeTag);

          return {
            youtubeTag,
            youtubeId,
            isThisDue,
            isThisNew,
            hasAllBeenReviewed,
          };
        },
      );

      const sortedComprehensiveState = comprehensiveState.sort((a, b) => {
        const rank = (obj) =>
          obj.isThisDue === true
            ? 0 // highest priority
            : obj.isThisNew === true
            ? 1 // second
            : obj.hasAllBeenReviewed
            ? 3
            : 2; // lowest

        return rank(a) - rank(b);
      });
      setContentSelectionState(sortedComprehensiveState);
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
            const isThisNew = youtubeMetaData?.isThisNew;
            const hasAllBeenReviewed = youtubeMetaData?.hasAllBeenReviewed;

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
                    'pb-1 rounded w-full relative',
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
                  {isThisNew && (
                    <span
                      className='absolute top-0.5 right-2'
                      style={{
                        fontSize: 10,
                      }}
                    >
                      🆕
                    </span>
                  )}
                  {hasAllBeenReviewed && (
                    <BookCheck
                      className='absolute top-0.5 right-1 bg-green-200 rounded'
                      style={{
                        fontSize: 5,
                      }}
                    />
                  )}
                </Button>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default ContentSelection;
