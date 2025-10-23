'use client';

import useData from '../../app/Providers/useData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import useLearningScreen from '../../app/LearningScreen/useLearningScreen';
import BreadCrumbHeaderBase from '../BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';

const BreadCrumbComponent = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const {
    sentencesState,
    setIsSentenceReviewState,
    wordsForReviewState,
    wordBasketState,
    setIsWordStudyState,
  } = useData();
  const { selectedContentState, handleOnHome } = useLearningScreen();
  const router = useRouter();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfSentences = sentencesState.length;
  const generalTopicName = selectedContentState?.generalTopicName;

  const firstHeader = 'Home';

  const buttonsArr = [
    {
      onClick: () => setIsSentenceReviewState(true),
      disabled: !(numberOfSentences > 0),
      variant: 'secondary',
      text: `Sentence reviews (${numberOfSentences})`,
    },
    {
      onClick: () => setIsWordStudyState(true),
      disabled: !(wordsForReviewState.length > 0),
      variant: 'secondary',
      text: `Words due (${wordsForReviewState.length})`,
    },
    {
      onClick: () => router.push('/youtube-upload'),
      variant: 'secondary',
      text: `Add content`,
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
      />
    </div>
  );
};

export default BreadCrumbComponent;
