import { useMemo } from 'react';
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

const LearningScreenTabTranscript = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    masterPlay,
    isGenericItemLoadingState,
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
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';

  const biggestOverlappedSnippet = useMemo(() => {
    if (overlappingSnippetDataState.length === 0) {
      return null;
    }
    if (overlappingSnippetDataState.length > 1) {
      return getBiggestOverlap(overlappingSnippetDataState).id;
    }
    return overlappingSnippetDataState[0].id;
  }, [overlappingSnippetDataState]);

  useAutoScrollToCurrentItem({
    trackCurrentState,
    masterPlay,
    transcriptRef,
    isInReviewMode,
    learnFormattedTranscript,
  });

  return (
    <TabsContent
      value='transcript'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      {!isInReviewMode && (
        <ReviewTypeToggles
          enableWordReviewState={enableWordReviewState}
          setEnableWordReviewState={setEnableWordReviewState}
          enableTranscriptReviewState={enableTranscriptReviewState}
          setEnableTranscriptReviewState={setEnableTranscriptReviewState}
          enableSnippetReviewState={enableSnippetReviewState}
          setEnableSnippetReviewState={setEnableSnippetReviewState}
          wordsCount={0}
          sentencesCount={0}
          snippetsCount={0}
          reviewIntervalState={reviewIntervalState}
          setReviewIntervalState={setReviewIntervalState}
          isInReviewMode={isInReviewMode}
          setIsInReviewMode={setIsInReviewMode}
        />
      )}
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
                  isGenericItemLoadingState={isGenericItemLoadingState}
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
    </TabsContent>
  );
};

export default LearningScreenTabTranscript;
