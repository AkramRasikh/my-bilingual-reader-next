import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import useData from '../Providers/useData';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';

const LearningScreenContentChapterNavigation = () => {
  const [sentenceRepsPerMinState, setSentenceRepsPerMinState] = useState<
    string | null
  >(null);

  const {
    handleSelectedContent,
    contentMetaMemoized,
    contentMetaWordMemoized,
    sentenceRepsState,
    elapsed,
    numberOfSentencesPendingOrDueState,
  } = useLearningScreen();

  const prevValueSentencesRef = useRef(sentenceRepsState);

  useEffect(() => {
    if (elapsed > 0 && sentenceRepsState !== prevValueSentencesRef.current) {
      prevValueSentencesRef.current = sentenceRepsState;
      const perMinute = (sentenceRepsState / elapsed) * 60;
      setSentenceRepsPerMinState(perMinute.toFixed(1));
    }
  }, [sentenceRepsState, elapsed]);

  const hasUnifiedChapter = contentMetaMemoized?.length === 1;

  if (hasUnifiedChapter) {
    return (
      <LearningScreenUnifiedAnalytics
        sentenceRepsPerMinState={sentenceRepsPerMinState}
      />
    );
  }

  return (
    <ul className='flex flex-col gap-1 overflow-y-scroll max-h-96 pr-2.5'>
      {!hasUnifiedChapter && (
        <Button variant='outline'>
          All{' '}
          <span className='text-xs font-medium italic'>
            ({numberOfSentencesPendingOrDueState})
          </span>
        </Button>
      )}
      {contentMetaMemoized?.map((thisContentMetaData, index) => {
        const chapterNum = thisContentMetaData.chapterNum;
        const title = thisContentMetaData.title;
        const isSelected = thisContentMetaData.isSelected;
        const sentencesNeedReview = thisContentMetaData.sentencesNeedReview;
        const hasBeenReviewed = thisContentMetaData.hasBeenReviewed;

        const wordsIndex = contentMetaWordMemoized[index]?.length;

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
