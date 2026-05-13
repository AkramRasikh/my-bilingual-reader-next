import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import getBiggestOverlap from '@/components/custom/TranscriptItem/get-biggest-overlap';
import LearningScreenComprehensiveReview from '../LearningScreenComprehensiveReview';
import useAutoScrollToCurrentItem from './useAutoScrollToCurrentItem';
import ReviewTypeToggles from '../components/ReviewTypeToggles';
import useComprehensiveReviewModeData from '../hooks/useComprehensiveReviewModeData';

const LearningScreenTabTranscript = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    masterPlay,
    isGenericItemsLoadingArrayState,
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
    learnFormattedTranscript,
    handleDeleteSnippet,
    savedSnippetsMemoized,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    overlappingTextMemoized,
    handleSaveSnippet,
    setIsInReviewMode,
    trackCurrentState,
    enableWordReviewState,
    setEnableWordReviewState,
    enableTranscriptReviewState,
    setEnableTranscriptReviewState,
    enableSnippetReviewState,
    setEnableSnippetReviewState,
    reviewIntervalState,
    setReviewIntervalState,
    selectedContentTitleState,
    snippetLoadingState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    firstTime,
    firstTimeState,
    setFirstTimeState,
    contentMetaWordMemoized,
    snippetsWithDueStatusMemoized,
    formattedTranscriptState,
  } = useLearningScreen();
  const { languageSelectedState, wordsState } = useFetchData();
  const transcriptScrollContainerRef = useRef<HTMLDivElement>(null);

  const biggestOverlappedSnippet = useMemo(() => {
    if (overlappingSnippetDataState.length === 0) {
      return null;
    }
    if (overlappingSnippetDataState.length > 1) {
      return getBiggestOverlap(overlappingSnippetDataState).id;
    }
    return overlappingSnippetDataState[0].id;
  }, [overlappingSnippetDataState]);

  const { postWordsMemoized, postSnippetsMemoized, postSentencesMemoized } =
    useComprehensiveReviewModeData({
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

  useAutoScrollToCurrentItem({
    trackCurrentState,
    masterPlay,
    transcriptRef,
    isInReviewMode,
    learnFormattedTranscript,
  });

  useEffect(() => {
    if (!isInReviewMode) return;
    transcriptScrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [isInReviewMode]);

  return (
    <div className={'border rounded-lg'}>
      <ReviewTypeToggles
        enableWordReviewState={enableWordReviewState}
        setEnableWordReviewState={setEnableWordReviewState}
        enableTranscriptReviewState={enableTranscriptReviewState}
        setEnableTranscriptReviewState={setEnableTranscriptReviewState}
        enableSnippetReviewState={enableSnippetReviewState}
        setEnableSnippetReviewState={setEnableSnippetReviewState}
        wordsCount={postWordsMemoized?.length || 0}
        sentencesCount={postSentencesMemoized.length || 0}
        snippetsCount={postSnippetsMemoized?.length || 0}
        reviewIntervalState={reviewIntervalState}
        setReviewIntervalState={setReviewIntervalState}
        isInReviewMode={isInReviewMode}
        setIsInReviewMode={setIsInReviewMode}
      />
      <TabsContent value='transcript' className='min-h-0'>
        <div
          ref={transcriptScrollContainerRef}
          className='max-h-130 min-[1367px]:max-h-150 overflow-y-auto'
        >
          {isInReviewMode ? (
            <LearningScreenComprehensiveReview />
          ) : (
            <ul
              className={clsx(
                'gap-1',
                isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
              )}
              ref={transcriptRef}
            >
              {learnFormattedTranscript.map((contentItem, index) => {
                return (
                  <div key={index}>
                    <TranscriptItemProvider
                      indexNum={index}
                      threeSecondLoopState={threeSecondLoopState}
                      overlappingSnippetDataState={overlappingSnippetDataState}
                      contentItem={contentItem}
                      masterPlay={masterPlay}
                      isGenericItemsLoadingArrayState={
                        isGenericItemsLoadingArrayState
                      }
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
                      isBreakingDownSentenceArrState={
                        isBreakingDownSentenceArrState
                      }
                      scrollToElState={scrollToElState}
                      wordsForSelectedTopic={wordsForSelectedTopic}
                      languageSelectedState={languageSelectedState}
                      savedSnippetsMemoized={savedSnippetsMemoized}
                      handleDeleteSnippet={handleDeleteSnippet}
                      setThreeSecondLoopState={setThreeSecondLoopState}
                      setContractThreeSecondLoopState={
                        setContractThreeSecondLoopState
                      }
                      handlePlayFromHere={handlePlayFromHere}
                      biggestOverlappedSnippet={biggestOverlappedSnippet}
                      overlappingTextMemoized={overlappingTextMemoized}
                      handleSaveSnippet={handleSaveSnippet}
                      originalContext={selectedContentTitleState}
                      snippetLoadingState={snippetLoadingState}
                    >
                      <TranscriptItem />
                    </TranscriptItemProvider>
                  </div>
                );
              })}
            </ul>
          )}
        </div>
      </TabsContent>
    </div>
  );
};

export default LearningScreenTabTranscript;
