import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import ReviewSRSToggles from './ReviewSRSToggles';
import { isDueCheck } from './DataProvider';
import clsx from 'clsx';
import { getTimeDiffSRS } from './getTimeDiffSRS';
import LoadingSpinner from './LoadingSpinner';
import GoogleSearchImage from './GoogleSearchImage';
import PasteImageCard from './PasteImageCard';
import useData from './useData';
import { getCloudflareImageURL } from './get-firebase-media-url';
import Image from 'next/image';

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
  imageUrl,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const timeNow = new Date();
  const isWordDue = isDueCheck({ reviewData }, timeNow);

  const { addImageDataProvider } = useData();

  const cloudflareImageUrl = imageUrl
    ? getCloudflareImageURL(imageUrl, 'japanese')
    : '';

  const previewImage = !openContentState && cloudflareImageUrl;

  const isDueText = !isWordDue
    ? getTimeDiffSRS({
        dueTimeStamp: new Date(reviewData.due),
        timeNow: timeNow,
      })
    : '';

  const addImage = async (formData) => {
    try {
      setIsLoadingState(true);
      await addImageDataProvider({ wordId: id, formData });
    } catch (error) {
      console.log('## handleReviewFunc', error);
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleReviewFunc = async (arg) => {
    try {
      setIsLoadingState(true);
      await updateWordData(arg);
    } catch (error) {
      console.log('## handleReviewFunc', error);
    } finally {
      setIsLoadingState(false);
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
              {previewImage && (
                <div className='relative w-4/5 h-40 m-auto'>
                  <Image
                    src={cloudflareImageUrl}
                    alt={baseForm}
                    fill
                    className='object-contain'
                  />
                </div>
              )}
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
          {!previewImage && (
            <div
              className={clsx(
                !openContentState ? 'blur-xs' : '',
                'flex flex-col gap-1 mb-4 flex-wrap',
              )}
            >
              {baseForm && (
                <span className='text-sm font-medium my-auto'>
                  BaseForm: {baseForm}
                </span>
              )}
              {surfaceForm && (
                <span className='text-sm font-medium'>
                  Surface Form: {surfaceForm}
                </span>
              )}
              {phonetic && (
                <span className='text-sm font-medium'>
                  Phonetic: {phonetic}
                </span>
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
          )}
          {openContentState && cloudflareImageUrl ? (
            <Image
              height={150}
              width={250}
              src={cloudflareImageUrl}
              alt={baseForm}
              className='m-auto pb-1 rounded'
            />
          ) : openContentState ? (
            <div className='flex gap-1.5'>
              <PasteImageCard id={id} addImage={addImage} />
              <div className='flex flex-row-reverse m-auto'>
                <GoogleSearchImage query={baseForm} />
              </div>
            </div>
          ) : null}

          {isWordDue ? (
            <ReviewSRSToggles
              contentItem={{
                id,
                reviewData,
                ...rest,
              }}
              handleReviewFunc={handleReviewFunc}
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
