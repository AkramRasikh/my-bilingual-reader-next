import { useEffect, useRef, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isDueCheck } from '@/utils/is-due-check';
import { getCloudflareImageURL } from '@/utils/get-media-url';
import { getTimeDiffSRS } from '@/app/srs-utils/get-time-diff-srs';
import { Trash } from 'lucide-react';
import ReviewSRSToggles from '../ReviewSRSToggles';
import WordCardInformation from './WordCardInformation';
import WordCardImage from './WordCardImage';
import AnimationWrapper from '../AnimationWrapper';
import WordCardConditionalContentWrapper from './WordCardConditionalContentWrapper';
import WordCardHeader from './WordCardHeader';
import WordCardWrapper from './WordCardWrapper';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import { sentenceSnippetGamepadBridge } from '@/app/LearningScreen/sentence-snippets/sentence-snippet-gamepad-bridge';

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
  adhocSentenceCustomWord,
  getSentenceFromContextId,
  contextSentences,
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
  const secondContextId = contexts[1];
  const secondContextAudioUrl = secondContextId ? secondContextId : null;

  const cloudflareImageUrl = imageUrl
    ? getCloudflareImageURL(imageUrl, languageSelectedState)
    : '';

  const previewImage = !openContentState && cloudflareImageUrl;
  const sentencePrevious = contextSentences?.previous || '';
  const sentenceCurrent = contextSentences?.current || '';
  const sentenceNext = contextSentences?.next || '';
  const hasSentenceWindow = Boolean(
    sentencePrevious || sentenceCurrent || sentenceNext,
  );

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

  const handleRemoveReview = async () => {
    await handleReviewFunc({
      wordId: id,
      isRemoveReview: true,
    });
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

      const map = getButtonMap(gamepad);
      const aPressed = gamepad.buttons[map.A_BTN]?.pressed;
      const bPressed = gamepad.buttons[map.B_BTN]?.pressed;
      const rPressed = gamepad.buttons[map.R1_BTN]?.pressed;

      if (aPressed && rPressed && !quickReviewToggleFiredRef.current) {
        setOpenContentState((prev) => !prev);
        quickReviewToggleFiredRef.current = true;
        return;
      }

      if (!aPressed || !rPressed) {
        quickReviewToggleFiredRef.current = false;
      }

      // B without R1 — avoids A+R1 toggle combo also firing play.
      // In a sentence-snippet clip loop, B only ends the loop.
      if (
        bPressed &&
        !rPressed &&
        !sentenceSnippetGamepadBridge.shouldIgnoreB()
      ) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WordCardHeader
            id={id}
            textTitle={textTitle}
            onClickPlayContext={handlePlayThisContext}
            setOpenContentState={setOpenContentState}
            openContentState={openContentState}
            wordContextIsPlaying={wordContextIsPlaying}
            wordHasOverlappingSnippetTime={wordHasOverlappingSnippetTime}
            audioSrc={secondContextAudioUrl}
            languageSelectedState={languageSelectedState}
            adhocSentenceCustomWord={adhocSentenceCustomWord}
            getSentenceFromContextId={getSentenceFromContextId}
            surfaceForm={surfaceForm}
            originalContextId={originalContextId}
          />
        </div>

        <WordCardConditionalContentWrapper
          setOpenContentState={setOpenContentState}
          openContentState={openContentState}
          previewImage={previewImage}
          src={cloudflareImageUrl}
          baseForm={baseForm}
        >
          <AnimationWrapper>
            <CardContent className='mt-2 p-0'>
              {openContentState && hasSentenceWindow && (
                <details
                  className='mb-2 px-1 text-sm'
                  data-testid={`word-card-sentence-${id}`}
                >
                  <summary className='cursor-pointer text-muted-foreground'>
                    Sentence
                  </summary>
                  <div className='mt-1 space-y-1'>
                    {sentencePrevious && (
                      <p>
                        <span className='text-muted-foreground'>Previous. </span>
                        {sentencePrevious}
                      </p>
                    )}
                    {sentenceCurrent && (
                      <p className='font-medium'>{sentenceCurrent}</p>
                    )}
                    {sentenceNext && (
                      <p>
                        <span className='text-muted-foreground'>Next. </span>
                        {sentenceNext}
                      </p>
                    )}
                  </div>
                </details>
              )}
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
        <div className='flex w-full items-center justify-between gap-2 m-1'>
          <span className='font-medium text-sm'>{isDueText}</span>
          <Button
            variant='destructive'
            data-testid={`review-srs-toggles-remove-${id}`}
            disabled={isLoadingState}
            onClick={handleRemoveReview}
          >
            <Trash />
          </Button>
        </div>
      )}
    </WordCardWrapper>
  );
};

export default WordCard;
