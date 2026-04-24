import { useMemo } from 'react';
import clsx from 'clsx';
import useLearningScreen from './useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './TabContent/LearningScreenTabTranscriptNestedWordsReview';
import ReviewTypeToggles from './components/ReviewTypeToggles';
import SnippetReview from '@/components/custom/SnippetReview';
import { Snippet } from '../types/content-types';
import useComprehensiveReviewModeData from './hooks/useComprehensiveReviewModeData';
import getBiggestOverlap from '@/components/custom/TranscriptItem/get-biggest-overlap';

interface HandleReviewSnippetsComprehensiveReviewProps {
  snippetData: Snippet;
  isRemoveReview?: boolean;
  isSnippetReview?: boolean;
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
    handleLoopReviewMode,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    contentSnippets,
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
    currentTime,
    getSentenceDataOfOverlappingWordsDuringSave,
    sentenceMapMemoized,
    firstTimeState,
    setFirstTimeState,
    handlePlayFromHere,
    handleDeleteSnippet,
    overlappingTextMemoized,
    handleSaveSnippet,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useLearningScreen();
  const { languageSelectedState, wordsState } = useFetchData();

  const {
    postWordsMemoized,
    postSnippetsMemoized,
    slicedTranscriptArray,
    transcriptDueNumber: _unusedTranscriptDueNumber,
    postSentencesMemoized,
  } = useComprehensiveReviewModeData({
    enableWordReviewState,
    enableSnippetReviewState,
    enableTranscriptReviewState,
    firstTime,
    firstTimeState,
    setFirstTimeState,
    reviewIntervalState,
    contentMetaWordMemoized,
    snippetsWithDueStatusMemoized,
    formattedTranscriptState,
  });

  const biggestOverlappedSnippet = useMemo(() => {
    if (overlappingSnippetDataState.length === 0) {
      return null;
    }
    if (overlappingSnippetDataState.length > 1) {
      return getBiggestOverlap(overlappingSnippetDataState).id;
    }
    return overlappingSnippetDataState[0].id;
  }, [overlappingSnippetDataState]);

  const firstElIdInReview = [
    ...postSnippetsMemoized,
    ...postWordsMemoized,
    ...postSentencesMemoized,
  ]?.[0]?.id;

  const handleReviewSnippetsComprehensiveReview = async ({
    snippetData,
    isRemoveReview,
    isSnippetReview,
  }: HandleReviewSnippetsComprehensiveReviewProps) => {
    await handleUpdateSnippet({
      snippetData,
      isRemoveReview,
      isSnippetReview,
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
                handleLoopHere={(params) =>
                  handleLoopReviewMode({ ...params, snippetId: item.id })
                }
                isVideoPlaying={isVideoPlaying}
                threeSecondLoopState={threeSecondLoopState}
                handleUpdateSnippetComprehensiveReview={
                  handleReviewSnippetsComprehensiveReview
                }
                isReadyForQuickReview={firstElIdInReview === item.id}
                handleBreakdownSentence={({ sentenceId }) =>
                  handleBreakdownSentence({
                    sentenceId,
                    targetLang:
                      sentenceMapMemoized[sentenceId]?.targetLang || '',
                  })
                }
                isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
                currentTime={currentTime}
                getSentenceDataOfOverlappingWordsDuringSave={(
                  time,
                  highlightedText,
                ) => {
                  const out = getSentenceDataOfOverlappingWordsDuringSave(
                    time,
                    highlightedText,
                  );
                  return typeof out === 'string' ? out : null;
                }}
                selectedContentTitleState={selectedContentTitleState}
                sentenceMapMemoized={sentenceMapMemoized}
                languageSelectedState={languageSelectedState}
                wordsState={wordsState}
                handleSaveWord={handleSaveWord}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
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
        ref={transcriptRef as unknown as React.RefObject<HTMLUListElement>}
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
              savedSnippetsMemoized={contentSnippets}
              handleDeleteSnippet={async (snippetId) => {
                const snippetData = contentSnippets.find(
                  (s) => s.id === snippetId,
                );
                if (!snippetData) return;
                await handleDeleteSnippet(snippetData);
              }}
              isComprehensiveMode={true}
              setThreeSecondLoopState={setThreeSecondLoopState}
              setContractThreeSecondLoopState={setContractThreeSecondLoopState}
              handlePlayFromHere={handlePlayFromHere}
              biggestOverlappedSnippet={biggestOverlappedSnippet}
              overlappingTextMemoized={overlappingTextMemoized}
              handleSaveSnippet={
                handleSaveSnippet as unknown as (args: {
                  targetLang: string;
                  baseLang: string;
                  suggestedFocusText: string;
                }) => Promise<void>
              }
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
