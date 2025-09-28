import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import useData from '../useData';

const LearningScreenContentChapterNavigation = () => {
  const [contentMetaDataState, setContentMetaDataState] = useState([]);
  const [contentMetaWordDataState, setContentMetaWordDataState] = useState([]);
  const {
    getGeneralContentMetaData,
    handleGetComprehensiveReview,
    generalTopicDisplayNameSelectedState,
    handleSelectedContent,
    getGeneralContentWordData,
    wordsState,
    selectedContentState,
  } = useData();

  useEffect(() => {
    const contentMetaData =
      generalTopicDisplayNameSelectedState && getGeneralContentMetaData();
    const wordMetaData =
      generalTopicDisplayNameSelectedState && getGeneralContentWordData();

    setContentMetaDataState(contentMetaData);
    setContentMetaWordDataState(wordMetaData);
  }, [wordsState, selectedContentState]);

  const hasUnifiedChapter = contentMetaDataState.length === 1;

  if (hasUnifiedChapter) {
    const sentencesNeedReview = contentMetaDataState[0]?.sentencesNeedReview;

    return (
      <div>
        <p className='text-xs font-medium m-auto w-fit'>
          Sentences: {sentencesNeedReview}
        </p>
        <p className='text-xs font-medium m-auto w-fit'>
          Words: {contentMetaWordDataState[0].length}
        </p>
      </div>
    );
  }

  return (
    <ul className='flex flex-col gap-1 overflow-y-scroll max-h-96'>
      {!hasUnifiedChapter && (
        <Button variant='outline' onClick={handleGetComprehensiveReview}>
          All
        </Button>
      )}
      {contentMetaDataState?.map((thisContentMetaData, index) => {
        const chapterNum = thisContentMetaData.chapterNum;
        const title = thisContentMetaData.title;
        const isSelected = thisContentMetaData.isSelected;
        const sentencesNeedReview = thisContentMetaData.sentencesNeedReview;
        const hasBeenReviewed = thisContentMetaData.hasBeenReviewed;

        const wordsIndex = contentMetaWordDataState[index]?.length;

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
            {sentencesNeedReview > 0 && (
              <>
                <span
                  className='absolute left-1/12 top-8/12'
                  style={{
                    fontSize: 10,
                  }}
                >
                  🔤
                </span>
                <span
                  className='italic absolute left-1/12 top-2/12'
                  style={{
                    fontSize: 10,
                  }}
                >
                  ({sentencesNeedReview})
                </span>
              </>
            )}
            {chapterNum}
            {wordsIndex > 0 && (
              <span
                className='absolute left-2/3'
                style={{
                  fontSize: 10,
                }}
              >
                ({wordsIndex})
              </span>
            )}
          </Button>
        );
      })}
    </ul>
  );
};

export default LearningScreenContentChapterNavigation;
