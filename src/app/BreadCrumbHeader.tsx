'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useData from './useData';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import DialogueHomeScreen from './DialogueHomeScreen';

const BreadcrumbComponent = () => {
  const [showBasketState, setShowBasketState] = useState(false);
  const {
    selectedContentState,
    generalTopicDisplayNameSelectedState,
    setSelectedContentState,
    setGeneralTopicDisplayNameSelectedState,
    checkHowManyOfTopicNeedsReview,
    sentencesState,
    setIsSentenceReviewState,
    isSentenceReviewState,
    wordBasketState,
    setWordBasketState,
  } = useData();

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
  const handleThisGeneralTopic = () => {
    setSelectedContentState(null);
  };

  const removeFromBasket = (wordId) => {
    setWordBasketState((prev) => prev.filter((i) => i.id === wordId));
  };
  const handleOpenBasket = () => {
    if (wordBasketState.length === 0) {
      return null;
    }
    if (showBasketState) {
      setShowBasketState(false);
    } else {
      setShowBasketState(true);
    }
  };

  const title = selectedContentState?.title;

  return (
    <>
      <div className='flex justify-between'>
        <Breadcrumb className='my-auto mx-1'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleOnHome}>Topics</BreadcrumbLink>
            </BreadcrumbItem>
            {generalTopicDisplayNameSelectedState && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleThisGeneralTopic}>
                    {generalTopicDisplayNameSelectedState}{' '}
                    {theseSentencesDue?.length > 0
                      ? `(${theseSentencesDue?.length})`
                      : null}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {title && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <Button onClick={handleOpenBasket}>
            Basket 🧺 ({wordBasketState.length})
          </Button>

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
      {showBasketState ? (
        <div>
          <ul>
            {wordBasketState.map((basketItem, indexBasketItem) => (
              <li key={basketItem.id} className='flex gap-2 '>
                <span className='my-auto'>
                  {indexBasketItem + 1}) {basketItem.word},{' '}
                  {basketItem.definition}
                </span>
                <Button onClick={removeFromBasket} variant='ghost' size='icon'>
                  ❌
                </Button>
              </li>
            ))}
          </ul>
          <DialogueHomeScreen />
        </div>
      ) : null}
    </>
  );
};

export default BreadcrumbComponent;
