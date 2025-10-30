'use client';

import useData from '../../app/Providers/useData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import useLearningScreen from '../../app/LearningScreen/useLearningScreen';
import BreadCrumbHeaderBase from '../BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import ProgressHeader, { useProgressHeader } from './ProgressHeader';

const BreadCrumbComponent = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const [progressState, setProgressState] = useState(false);
  const { sentencesState, wordsForReviewMemoized, wordBasketState } = useData();
  const {
    selectedContentState,
    handleOnHome,
    numberOfSentenceDueOnMountState,
    contentMetaMemoized,
  } = useLearningScreen();
  const router = useRouter();

  const { languageSelectedState, setLanguageSelectedState } = useFetchData();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);
  const sentencesNeedReview = contentMetaMemoized?.[0]?.sentencesNeedReview;

  useProgressHeader({
    setProgressState,
    initNumState: numberOfSentenceDueOnMountState,
    currentStateNumber: sentencesNeedReview,
  });

  const numberOfStudiedSentences =
    numberOfSentenceDueOnMountState - sentencesNeedReview;

  const progressText = `${numberOfStudiedSentences}/${numberOfSentenceDueOnMountState}`;

  const numberOfSentences = sentencesState.length;
  const generalTopicName = selectedContentState?.generalTopicName;

  const firstHeader = 'Home';

  const buttonsArr = [
    {
      onClick: () => router.push('/sentences'),
      disabled: !(numberOfSentences > 0),
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
    },
    {
      onClick: () => router.push('/words'),
      disabled: !(wordsForReviewMemoized.length > 0),
      variant: 'link',
      text: `Words (${wordsForReviewMemoized.length})`,
    },
    {
      onClick: () => router.push('/youtube-upload'),
      variant: 'link',
      text: 'Content',
    },
  ];

  return (
    <div className='flex justify-between'>
      <BreadCrumbHeaderBase
        heading={firstHeader}
        onClick={handleOnHome}
        subHeading={generalTopicName}
        navigationButtons={() =>
          buttonsArr.map((item, index) => {
            return (
              <Button
                key={index}
                className='m-1.5'
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.variant}
              >
                {item.text}
              </Button>
            );
          })
        }
        progressHeaderComponent={
          sentencesNeedReview
            ? () => (
                <ProgressHeader
                  progressState={progressState}
                  progressText={progressText}
                  small
                />
              )
            : null
        }
      />
      <LanguageSelector
        defaultValue={languageSelectedState}
        onChange={setLanguageSelectedState}
      />
    </div>
  );
};

export default BreadCrumbComponent;
