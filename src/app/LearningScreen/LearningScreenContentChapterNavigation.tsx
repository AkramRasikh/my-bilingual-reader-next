import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import useData from '../Providers/useData';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';

const LearningScreenContentChapterNavigation = () => {
  const { handleGetComprehensiveReview, wordsState } = useData();
  const [repsPerMinState, setRepsPerMinState] = useState<string | null>(null);

  const {
    generalTopicDisplayNameSelectedState,
    selectedContentState,
    getGeneralContentMetaData,
    handleSelectedContent,
    getGeneralContentWordData,
    contentMetaDataState,
    setContentMetaDataState,
    contentMetaWordDataState,
    setContentMetaWordDataState,
    sentenceRepsState,
    elapsed,
  } = useLearningScreen();

  const prevValueRef = useRef(sentenceRepsState);

  useEffect(() => {
    if (elapsed > 0 && sentenceRepsState !== prevValueRef.current) {
      prevValueRef.current = sentenceRepsState;
      const perMinute = (sentenceRepsState / elapsed) * 60;
      setRepsPerMinState(perMinute.toFixed(1));
    }
  }, [sentenceRepsState, elapsed]);

  useEffect(() => {
    if (!generalTopicDisplayNameSelectedState) {
      return;
    }
    setContentMetaDataState(getGeneralContentMetaData());
    setContentMetaWordDataState(getGeneralContentWordData());
  }, [wordsState, selectedContentState]);

  const hasUnifiedChapter = contentMetaDataState?.length === 1;

  if (hasUnifiedChapter) {
    return <LearningScreenUnifiedAnalytics repsPerMinState={repsPerMinState} />;
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
                  👀
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
