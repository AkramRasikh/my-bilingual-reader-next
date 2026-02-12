import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import useLearningScreen from './useLearningScreen';
import { isWithinInterval } from '@/utils/is-within-interval';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './TabContent/LearningScreenTabTranscriptNestedWordsReview';
import ReviewTypeToggles from './components/ReviewTypeToggles';
import { Snippet } from '../types/content-types';
import SnippetReview from './experimental/SnippetReview';

interface HandleReviewSnippetsComprehensiveReviewProps {
  snippetData: Snippet;
  isRemoveReview?: boolean;
}

const LearningScreenComprehensiveReview = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    masterPlay,
    isGenericItemsLoadingArrayState,
    snippetLoadingState,
    isBreakingDownSentenceArrState,
    isInReviewMode,
    onlyShowEngState,
    setLoopTranscriptState,
    loopTranscriptState,
    handleReviewFunc,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    handleBreakdownSentence,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
    formattedTranscriptState,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    savedSnippetsMemoized,
    enableWordReviewState,
    setEnableWordReviewState,
    enableTranscriptReviewState,
    setEnableTranscriptReviewState,
    enableSnippetReviewState,
    setEnableSnippetReviewState,
    reviewIntervalState,
    setReviewIntervalState,
    firstTime,
    contentMetaWordMemoized,
    snippetsWithDueStatusMemoized,
    setIsInReviewMode,
    selectedContentTitleState,
    handleUpdateSnippet,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const [firstTimeState, setFirstTimeState] = useState(null);

  const postWordsMemoized = useMemo(() => {
    if (!enableWordReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return contentMetaWordMemoized.filter((item) =>
        isWithinInterval(item, firstTimeState, reviewIntervalState),
      );
    }
    return [];
  }, [
    enableWordReviewState,
    firstTimeState,
    reviewIntervalState,
    contentMetaWordMemoized,
  ]);

  const postSnippetsMemoized = useMemo(() => {
    if (!enableSnippetReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return (
        snippetsWithDueStatusMemoized.filter((item) =>
          isWithinInterval(item, firstTimeState, reviewIntervalState),
        ) || []
      );
    }
    return [];
  }, [
    enableSnippetReviewState,
    firstTimeState,
    reviewIntervalState,
    snippetsWithDueStatusMemoized,
  ]);

  const slicedTranscriptArray = useMemo(() => {
    const indexFirstTime = formattedTranscriptState.findIndex(
      (item) => item.time >= firstTimeState,
    );
    const timeWithInterval = firstTimeState + reviewIntervalState;

    let indexLastTime = formattedTranscriptState.findIndex(
      (item) => item.time >= timeWithInterval,
    );
    if (indexLastTime === -1) {
      indexLastTime = formattedTranscriptState.length;
    }

    return formattedTranscriptState.slice(indexFirstTime, indexLastTime);
  }, [formattedTranscriptState, firstTimeState, reviewIntervalState]);

  const transcriptDueNumber = useMemo(() => {
    return slicedTranscriptArray.filter((item) => item.isDue);
  }, [slicedTranscriptArray]);

  const postSentencesMemoized = useMemo(() => {
    if (!enableTranscriptReviewState) {
      return [];
    } else if (firstTimeState !== null) {
      return transcriptDueNumber;
    }
    return [];
  }, [
    enableTranscriptReviewState,
    firstTimeState,
    reviewIntervalState,
    formattedTranscriptState,
    transcriptDueNumber,
  ]);

  useEffect(() => {
    if (
      postSentencesMemoized.length === 0 &&
      postWordsMemoized.length === 0 &&
      postSnippetsMemoized.length === 0
    ) {
      setFirstTimeState(firstTime);
    } else if (firstTime !== null && firstTime < firstTimeState) {
      setFirstTimeState(firstTime);
    }
  }, [
    postSentencesMemoized,
    postWordsMemoized,
    postSnippetsMemoized,
    firstTime,
    firstTimeState,
  ]);

  const firstElIdInReview = [
    ...postSnippetsMemoized,
    ...postWordsMemoized,
    ...postSentencesMemoized,
  ]?.[0]?.id;

  const handleLoopHere = ({
    time,
    isContracted,
  }: {
    time: number;
    isContracted: boolean;
  }) => {
    const playFromTime = time - (isContracted ? 0.75 : 1.5);
    setThreeSecondLoopState(time);
    setContractThreeSecondLoopState(isContracted);
    handlePlayFromHere(playFromTime);
  };

  const handleReviewSnippetsComprehensiveReview = async ({
    snippetData,
    isRemoveReview,
  }: HandleReviewSnippetsComprehensiveReviewProps) => {
    await handleUpdateSnippet({
      snippetData,
      isRemoveReview,
    });
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState(false);
  };

  if (
    postWordsMemoized?.length === 0 &&
    postSentencesMemoized?.length === 0 &&
    postSnippetsMemoized?.length === 0
  ) {
    return (
      <div>
        <ReviewTypeToggles
          enableWordReviewState={enableWordReviewState}
          setEnableWordReviewState={setEnableWordReviewState}
          enableTranscriptReviewState={enableTranscriptReviewState}
          setEnableTranscriptReviewState={setEnableTranscriptReviewState}
          enableSnippetReviewState={enableSnippetReviewState}
          setEnableSnippetReviewState={setEnableSnippetReviewState}
          wordsCount={postWordsMemoized?.length || 0}
          sentencesCount={postSentencesMemoized.length || 0}
          snippetsCount={postSnippetsMemoized?.length}
          reviewIntervalState={reviewIntervalState}
          setReviewIntervalState={setReviewIntervalState}
          isInReviewMode={isInReviewMode}
          setIsInReviewMode={setIsInReviewMode}
        />
        <h2 className='text-center'>Done!</h2>
      </div>
    );
  }

  return (
    <>
      <ReviewTypeToggles
        enableWordReviewState={enableWordReviewState}
        setEnableWordReviewState={setEnableWordReviewState}
        enableTranscriptReviewState={enableTranscriptReviewState}
        setEnableTranscriptReviewState={setEnableTranscriptReviewState}
        enableSnippetReviewState={enableSnippetReviewState}
        setEnableSnippetReviewState={setEnableSnippetReviewState}
        wordsCount={postWordsMemoized?.length || 0}
        sentencesCount={postSentencesMemoized.length || 0}
        snippetsCount={postSnippetsMemoized?.length}
        reviewIntervalState={reviewIntervalState}
        setReviewIntervalState={setReviewIntervalState}
        isInReviewMode={isInReviewMode}
        setIsInReviewMode={setIsInReviewMode}
      />
      {postSnippetsMemoized?.length > 0 ? (
        <div className='flex flex-col gap-2 mb-2'>
          {postSnippetsMemoized.map((item) => {
            return (
              <SnippetReview
                key={item.id}
                snippetData={item}
                handleLoopHere={handleLoopHere}
                isVideoPlaying={isVideoPlaying}
                threeSecondLoopState={threeSecondLoopState}
                handleUpdateSnippetComprehensiveReview={
                  handleReviewSnippetsComprehensiveReview
                }
                isReadyForQuickReview={firstElIdInReview === item.id}
                handleBreakdownSentence={handleBreakdownSentence}
              />
            );
          })}
        </div>
      ) : null}
      {postWordsMemoized?.length > 0 && (
        <LearningScreenTabTranscriptNestedWordsReview
          topicWordsForReviewMemoized={postWordsMemoized}
          withToggle={false}
          firstElIdInReview={firstElIdInReview}
        />
      )}

      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {slicedTranscriptArray?.map((contentItem, index) => {
          return (
            <TranscriptItemProvider
              key={index}
              indexNum={index}
              threeSecondLoopState={threeSecondLoopState}
              overlappingSnippetDataState={overlappingSnippetDataState}
              contentItem={contentItem}
              masterPlay={masterPlay}
              isGenericItemsLoadingArrayState={isGenericItemsLoadingArrayState}
              snippetLoadingState={snippetLoadingState}
              handleSaveWord={handleSaveWord}
              handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              wordsState={wordsState}
              isInReviewMode={isInReviewMode}
              onlyShowEngState={onlyShowEngState}
              setLoopTranscriptState={setLoopTranscriptState}
              loopTranscriptState={loopTranscriptState}
              handleReviewFunc={handleReviewFunc}
              isVideoPlaying={isVideoPlaying}
              handlePause={handlePause}
              handleFromHere={handleFromHere}
              handleBreakdownSentence={handleBreakdownSentence}
              isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
              scrollToElState={scrollToElState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              languageSelectedState={languageSelectedState}
              savedSnippetsMemoized={savedSnippetsMemoized}
              isComprehensiveMode={true}
              setThreeSecondLoopState={setThreeSecondLoopState}
              setContractThreeSecondLoopState={setContractThreeSecondLoopState}
              originalContext={selectedContentTitleState}
              isReadyForQuickReview={firstElIdInReview === contentItem.id}
            >
              <TranscriptItem />
            </TranscriptItemProvider>
          );
        })}
      </ul>
    </>
  );
};

export default LearningScreenComprehensiveReview;
