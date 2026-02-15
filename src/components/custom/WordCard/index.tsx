import { useEffect, useRef, useState } from 'react';
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
  mnemonic,
  addImageDataProvider,
  contexts,
  playFromThisContext,
  languageSelectedState,
  wordContextIsPlaying,
  handlePause,
  wordHasOverlappingSnippetTime,
  isReadyForQuickReview,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const quickReviewToggleFiredRef = useRef(false);
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
    } finally {
      setIsLoadingState(false);
      setOpenContentState(false);
    }
  };

  useEffect(() => {
    if (!isReadyForQuickReview) return;

    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads();
      // Find the first connected gamepad
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);

      if (!gamepad) {
        return;
      }

      const aPressed = gamepad.buttons[0]?.pressed;
      const bPressed = gamepad.buttons[1]?.pressed;
      const rPressed = gamepad.buttons[7]?.pressed;

      if (aPressed && rPressed && !quickReviewToggleFiredRef.current) {
        setOpenContentState((prev) => !prev);
        quickReviewToggleFiredRef.current = true;
        return;
      }

      if (!aPressed || !rPressed) {
        quickReviewToggleFiredRef.current = false;
      }

      // Only trigger if B button (1) is pressed AND R button (7) is NOT pressed
      // This prevents R+B combo from also triggering the play action
      if (bPressed && !rPressed) {
        handlePlayThisContext();
      }
    };

    const intervalId = setInterval(handleGamepadPress, 100);

    return () => clearInterval(intervalId);
  }, [isReadyForQuickReview, wordContextIsPlaying, originalContextId]);

  return (
    <WordCardWrapper
      id={id}
      isLoadingState={isLoadingState}
      isWordDue={isWordDue}
    >
      <AnimationWrapper>
        <WordCardHeader
          id={id}
          textTitle={textTitle}
          onClickPlayContext={handlePlayThisContext}
          setOpenContentState={setOpenContentState}
          openContentState={openContentState}
          wordContextIsPlaying={wordContextIsPlaying}
          wordHasOverlappingSnippetTime={wordHasOverlappingSnippetTime}
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
                  wordId={id}
                  baseForm={baseForm}
                  surfaceForm={surfaceForm}
                  phonetic={phonetic}
                  transliteration={transliteration}
                  definition={definition}
                  mnemonic={mnemonic}
                  updateWordData={updateWordData}
                  languageSelectedState={languageSelectedState}
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
          isReadyForQuickReview={isReadyForQuickReview}
        />
      ) : (
        <span className='font-medium text-sm'>{isDueText}</span>
      )}
    </WordCardWrapper>
  );
};

export default WordCard;
