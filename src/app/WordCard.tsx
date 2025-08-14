'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import useWords from './words/useWords';
import ReviewSRSToggles from './ReviewSRSToggles';
import { Label } from '@/components/ui/label';
import { isDueCheck } from './DataProvider';
import clsx from 'clsx';
import { getTimeDiffSRS } from './getTimeDiffSRS';
import { srsCalculationAndText, srsRetentionKeyTypes } from './srs-algo';
import LoadingSpinner from './LoadingSpinner';

export const WordCardContent = ({
  id,
  isInBasket,
  addWordToBasket,
  baseForm,
  definition,
  surfaceForm,
  phonetic,
  transliteration,
  updateWordData,
  defaultOpen,
  reviewData,
  rest,
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const timeNow = new Date();
  const isWordDue = isDueCheck({ reviewData }, timeNow);

  const isDueText = !isWordDue
    ? getTimeDiffSRS({
        dueTimeStamp: new Date(reviewData.due),
        timeNow: timeNow,
      })
    : '';

  const handleQuickEasy = async () => {
    const timeNow = new Date();

    const { nextScheduledOptions } = srsCalculationAndText({
      reviewData: rest,
      contentType: srsRetentionKeyTypes.vocab,
      timeNow,
    });

    const easyModeData = nextScheduledOptions['4'].card;

    try {
      setIsLoadingState(true);
      await updateWordData({
        wordId: id,
        fieldToUpdate: { reviewData: easyModeData },
        language: 'japanese',
      });
    } catch (error) {
      console.log('## handleNextReview', { error });
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <Card
      className={clsx(
        isWordDue ? 'bg-amber-500' : '',
        isLoadingState ? 'mask-b-from-gray-700' : '',
        'w-fit p-3 relative',
      )}
      style={{
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      {isLoadingState && (
        <div className='absolute left-5/10 top-1/3'>
          <LoadingSpinner />
        </div>
      )}
      <div className='flex gap-3'>
        <CardTitle className='m-auto'>{baseForm}</CardTitle>
        <Button onClick={handleQuickEasy}>EASY</Button>
        <Button
          variant={isInBasket ? 'destructive' : 'default'}
          onClick={() =>
            addWordToBasket?.({
              word: baseForm,
              id,
              definition,
            })
          }
        >
          🧺
        </Button>
        <Button onClick={() => setOpenContentState(!openContentState)}>
          ⠇
        </Button>
      </div>
      {openContentState && (
        <>
          <hr />
          <CardContent
            style={{
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          >
            <div className='flex flex-col gap-3 mb-4'>
              {surfaceForm && <Label>Surface Form: {surfaceForm}</Label>}
              {phonetic && <Label>Phonetic: {phonetic}</Label>}
              {transliteration && (
                <Label>Transliteration: {transliteration}</Label>
              )}
              {definition && <Label>Definition: {definition}</Label>}
            </div>
            {isWordDue ? (
              <ReviewSRSToggles
                contentItem={{
                  id,
                  reviewData,
                  ...rest,
                }}
                handleReviewFunc={updateWordData}
                isVocab
              />
            ) : (
              <span>{isDueText}</span>
            )}
          </CardContent>
        </>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
};

const WordCard = ({
  baseForm,
  id,
  definition,
  surfaceForm,
  phonetic,
  transliteration,
  defaultOpen = false,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const { addWordToBasket, wordBasketState, updateWordData } = useWords();

  const isInBasket = wordBasketState?.some((i) => i?.id === id);
  return (
    <Card
      className='w-fit p-3'
      style={{
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      <div className='flex gap-3'>
        <CardTitle className='m-auto'>{baseForm}</CardTitle>
        <Button>EASY</Button>
        <Button
          variant={isInBasket ? 'destructive' : 'default'}
          onClick={() =>
            addWordToBasket({
              word: baseForm,
              id,
              definition,
            })
          }
        >
          🧺
        </Button>
        <Button onClick={() => setOpenContentState(!openContentState)}>
          ⠇
        </Button>
      </div>
      {openContentState && (
        <>
          <hr />
          <CardContent
            style={{
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          >
            <div className='flex flex-col gap-3 mb-4'>
              {surfaceForm && <Label>Surface Form: {surfaceForm}</Label>}
              {phonetic && <Label>Phonetic: {phonetic}</Label>}
              {transliteration && (
                <Label>Transliteration: {transliteration}</Label>
              )}
              {definition && <Label>Definition: {definition}</Label>}
            </div>
            <ReviewSRSToggles
              contentItem={{
                id,
                ...rest,
              }}
              handleReviewFunc={updateWordData}
              isVocab
            />
          </CardContent>
        </>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
};

export default WordCard;
