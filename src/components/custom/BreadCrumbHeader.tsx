'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useData from '../../app/Providers/useData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import BasketDialogue from '../../app/BasketDialogue';
import useLearningScreen from '../../app/LearningScreen/useLearningScreen';

const BreadcrumbComponent = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const {
    sentencesState,
    setIsSentenceReviewState,
    isSentenceReviewState,
    wordBasketState,
  } = useData();
  const { selectedContentState, handleOnHome } = useLearningScreen();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfSentences = sentencesState.length;
  const generalTopicName = selectedContentState?.generalTopicName;

  return (
    <>
      <div className='flex justify-between'>
        <Breadcrumb className='my-auto mx-1'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleOnHome} className='cursor-pointer'>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {generalTopicName && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{generalTopicName}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <BasketDialogue />
          {!isSentenceReviewState ? (
            <Button
              className='m-1.5'
              onClick={() => setIsSentenceReviewState(true)}
              disabled={!(numberOfSentences > 0)}
              variant='secondary'
            >
              Sentence reviews ({numberOfSentences})
            </Button>
          ) : (
            <Button
              className='m-1.5'
              onClick={() => setIsSentenceReviewState(false)}
              variant='destructive'
            >
              Exit Sentence mode
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default BreadcrumbComponent;
