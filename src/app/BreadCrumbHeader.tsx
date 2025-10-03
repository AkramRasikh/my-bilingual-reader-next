'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useData from './Providers/useData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import BasketDialogue from './BasketDialogue';
import useLearningScreen from './LearningScreen/useLearningScreen';

const BreadcrumbComponent = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const {
    generalTopicDisplayNameSelectedState,
    sentencesState,
    setIsSentenceReviewState,
    isSentenceReviewState,
    wordBasketState,
  } = useData();
  const {
    selectedContentState,
    setGeneralTopicDisplayNameSelectedState,
    checkHowManyOfTopicNeedsReview,
    setSelectedContentState,
  } = useLearningScreen();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfSentences = sentencesState.length;

  const theseSentencesDue =
    generalTopicDisplayNameSelectedState && checkHowManyOfTopicNeedsReview();

  const handleOnHome = () => {
    setSelectedContentState(null);
    setGeneralTopicDisplayNameSelectedState('');
  };

  const title = selectedContentState?.title;
  const chapter = title?.split('-');
  const chapterNum = chapter?.[chapter?.length - 1];

  return (
    <>
      <div className='flex justify-between'>
        <Breadcrumb className='my-auto mx-1'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleOnHome}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            {generalTopicDisplayNameSelectedState && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {generalTopicDisplayNameSelectedState}{' '}
                  {theseSentencesDue?.length > 0
                    ? `(${theseSentencesDue?.length})`
                    : null}
                </BreadcrumbItem>
              </>
            )}
            {title && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chapter: {chapterNum}</BreadcrumbPage>
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
