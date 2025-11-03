import { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { isDueCheck } from '@/utils/is-due-check';
import { getCloudflareImageURL } from '@/utils/get-media-url';
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
  contexts,
  playFromThisContext,
  languageSelectedState,
  wordContextIsPlaying,
  handlePause,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const timeNow = new Date();
  const textTitle = indexNum + ') ' + definition;
  const isLegacyWordWithNoReview = !reviewData;
  const isWordDue =
    isLegacyWordWithNoReview || isDueCheck({ reviewData }, timeNow);

  const originalContextId = contexts[0];

  const cloudflareImageUrl = imageUrl
    ? getCloudflareImageURL(imageUrl, languageSelectedState)
    : '';

  const previewImage = !openContentState && cloudflareImageUrl;

  const isDueText = !isWordDue
    ? `Due in ${getTimeDiffSRS({
        dueTimeStamp: new Date(reviewData?.due),
        timeNow: timeNow,
      })}`
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

  const handlePlayThisContext = () => {
    if (wordContextIsPlaying) {
      handlePause?.();
      return;
    }
    if (originalContextId) {
      playFromThisContext(originalContextId);
    }
  };

  const handleReviewFunc = async (arg) => {
    try {
      setIsLoadingState(true);
      await updateWordData({ ...arg, language: languageSelectedState });
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

  return (
    <WordCardWrapper isLoadingState={isLoadingState} isWordDue={isWordDue}>
      <AnimationWrapper>
        <WordCardHeader
          textTitle={textTitle}
          isInBasket={isInBasket}
          onClickBasket={handleAddWordToBasket}
          onClickPlayContext={handlePlayThisContext}
          setOpenContentState={setOpenContentState}
          openContentState={openContentState}
          wordContextIsPlaying={wordContextIsPlaying}
        />

        <WordCardConditionalContentWrapper
          setOpenContentState={setOpenContentState}
          openContentState={openContentState}
          previewImage={previewImage}
          src={cloudflareImageUrl}
          baseForm={baseForm}
        >
          <AnimationWrapper>
            <CardContent className='mt-2 p-0'>
              {!previewImage && openContentState! && (
                <WordCardInformation
                  baseForm={baseForm}
                  surfaceForm={surfaceForm}
                  phonetic={phonetic}
                  transliteration={transliteration}
                  definition={definition}
                />
              )}
              <WordCardImage
                id={id}
                openContentState={openContentState}
                src={cloudflareImageUrl}
                baseForm={baseForm}
                addImage={addImage}
              />
            </CardContent>
          </AnimationWrapper>
        </WordCardConditionalContentWrapper>
      </AnimationWrapper>
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
        <span className='font-medium text-sm'>{isDueText}</span>
      )}
    </WordCardWrapper>
  );
};

export default WordCard;
