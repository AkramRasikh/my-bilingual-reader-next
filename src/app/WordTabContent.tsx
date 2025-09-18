import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import ReviewSRSToggles from './ReviewSRSToggles';
import { isDueCheck } from './DataProvider';
import clsx from 'clsx';
import { getTimeDiffSRS } from './getTimeDiffSRS';
import { srsCalculationAndText, srsRetentionKeyTypes } from './srs-algo';
import LoadingSpinner from './LoadingSpinner';

function ConditionalWrapper({ condition, wrapper, children }) {
  return condition ? wrapper(children) : children;
}

const WordTabContent = ({
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
  reduceChar = true,
  indexNum,
  ...rest
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
      setOpenContentState(false);
    }
  };

  const textTitle = indexNum + ') ' + definition;

  return (
    <div
      className={clsx(
        isWordDue ? 'bg-amber-200' : '',
        isLoadingState ? 'mask-b-from-gray-700' : '',
        'w-fit p-3 relative rounded-2xl',
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
      <div className='flex gap-3 flex-wrap justify-between'>
        <CardTitle
          style={{
            overflow: 'hidden',
            maxWidth: '27ch',
          }}
          className='my-auto text-ellipsis text-left'
        >
          {textTitle}
        </CardTitle>

        <Button
          variant={isInBasket ? 'destructive' : 'default'}
          className={clsx(!isInBasket ? 'bg-transparent' : '')}
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
      </div>

      <ConditionalWrapper
        condition={!openContentState}
        wrapper={(children) => {
          return (
            <button onDoubleClick={() => setOpenContentState(true)}>
              {children}
            </button>
          );
        }}
      >
        <CardContent
          className='mt-2 text-left p-0'
          style={{
            animation: 'fadeIn 0.5s ease-out forwards',
          }}
        >
          <div
            className={clsx(
              !openContentState ? 'blur-xs' : '',
              'flex flex-col gap-1 mb-4 flex-wrap',
            )}
          >
            {baseForm && (
              <span className='text-sm font-medium'>
                baseForm: {surfaceForm}
              </span>
            )}
            {surfaceForm && (
              <span className='text-sm font-medium'>
                Surface Form: {surfaceForm}
              </span>
            )}
            {phonetic && (
              <span className='text-sm font-medium'>Phonetic: {phonetic}</span>
            )}
            {transliteration && (
              <span className='text-sm font-medium'>
                Transliteration: {transliteration}
              </span>
            )}
            {definition && (
              <span className='text-sm font-medium'>
                Definition: {definition}
              </span>
            )}
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
      </ConditionalWrapper>

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
    </div>
  );
};

export default WordTabContent;
