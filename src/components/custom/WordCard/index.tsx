import { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { isDueCheck } from '@/utils/is-due-check';
import { getCloudflareImageURL } from '@/utils/get-media-url';
import PasteImageCard from '@/app/PasteImageCard';
import GoogleSearchImage from '../GoogleSearchImage';
import { getTimeDiffSRS } from '@/app/srs-utils/get-time-diff-srs';
import ReviewSRSToggles from '../ReviewSRSToggles';
import WordCardInformation from './WordCardInformation';
import WordCardImage from './WordCardImage';
import AnimationWrapper from '../AnimationWrapper';
import WordCardConditionalContentWrapper from './WordCardConditionalContentWrapper';
import WordCardHeader from './WordCardHeader';
import WordCardWrapper from './WordCardWrapper';

const WordCard = ({
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
  addImageDataProvider,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const timeNow = new Date();
  const isWordDue = isDueCheck({ reviewData }, timeNow);

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

  const handleAddWordToBasket = () =>
    addWordToBasket?.({
      word: baseForm,
      id,
      definition,
    });

  const textTitle = indexNum + ') ' + definition;

  return (
    <WordCardWrapper isLoadingState={isLoadingState} isWordDue={isWordDue}>
      <AnimationWrapper>
        <WordCardHeader
          textTitle={textTitle}
          isInBasket={isInBasket}
          onClick={handleAddWordToBasket}
        />

        <WordCardConditionalContentWrapper
          setOpenContentState={setOpenContentState}
          openContentState={openContentState}
          previewImage={previewImage}
          src={cloudflareImageUrl}
          baseForm={baseForm}
        >
          <AnimationWrapper>
            <CardContent className='mt-2 text-left p-0'>
              {!previewImage && (
                <WordCardInformation
                  openContentState={openContentState}
                  baseForm={baseForm}
                  surfaceForm={surfaceForm}
                  phonetic={phonetic}
                  transliteration={transliteration}
                  definition={definition}
                />
              )}
              {openContentState && cloudflareImageUrl ? (
                <WordCardImage src={cloudflareImageUrl} baseForm={baseForm} />
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
          </AnimationWrapper>
        </WordCardConditionalContentWrapper>
      </AnimationWrapper>
    </WordCardWrapper>
  );
};

export default WordCard;
