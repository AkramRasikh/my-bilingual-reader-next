'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import BreadCrumbHeaderBase from '../../components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';
import LanguageSelector from '../../components/custom/LanguageSelector';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import ProgressHeader, {
  useProgressHeader,
} from '../../components/custom/ProgressHeader';

const LearningScreenBreadCrumbHeader = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const [progressState, setProgressState] = useState(false);

  const { wordBasketState } = useFetchData();
  const {
    selectedContentState,
    numberOfSentenceDueOnMountState,
    sentencesNeedReview,
  } = useLearningScreen();

  const {
    languageSelectedState,
    setLanguageSelectedState,
    wordsForReviewMemoized,
    sentencesDueForReviewMemoized,
  } = useFetchData();

  const router = useRouter();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfStudiedSentences =
    numberOfSentenceDueOnMountState - sentencesNeedReview;
  const updatedNumberOfSentencesDue =
    numberOfStudiedSentences < 0
      ? numberOfSentenceDueOnMountState + Math.abs(numberOfStudiedSentences)
      : numberOfSentenceDueOnMountState;

  const numberOfStudiedSentencesUpdated =
    numberOfStudiedSentences < 0 ? 0 : numberOfStudiedSentences;

  useProgressHeader({
    setProgressState,
    initNumState: updatedNumberOfSentencesDue,
    currentStateNumber: sentencesNeedReview,
  });

  const progressText = `${numberOfStudiedSentencesUpdated}/${updatedNumberOfSentencesDue}`;

  const numberOfSentences = sentencesDueForReviewMemoized.length;
  const generalTopicName = selectedContentState.title;

  const firstHeader = 'Home';

  const handleOnHome = () => router.push('/');

  const buttonsArr = [
    {
      onClick: () => router.push('/sentences'),
      disabled: !(numberOfSentences > 0),
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
      dataTestId: 'breadcrumb-sentences-button',
    },
    {
      onClick: () => router.push('/words'),
      disabled: !(wordsForReviewMemoized.length > 0),
      variant: 'link',
      text: `Words (${wordsForReviewMemoized.length})`,
      dataTestId: 'breadcrumb-words-button',
    },
    {
      onClick: () => router.push('/youtube-upload'),
      variant: 'link',
      text: 'Content',
      dataTestId: 'breadcrumb-content-button',
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
                data-testid={item.dataTestId}
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

export default LearningScreenBreadCrumbHeader;
