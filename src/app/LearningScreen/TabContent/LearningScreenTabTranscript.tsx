import { useMemo } from 'react';
import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';
import getBiggestOverlap from '@/components/custom/TranscriptItem/get-biggest-overlap';

const LearningScreenTabTranscript = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    breakdownSentencesArrState,
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
    setBreakdownSentencesArrState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
    learnFormattedTranscript,
    sentencesForReviewMemoized,
    handleDeleteSnippet,
    savedSnippetsMemoized,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    overlappingTextMemoized,
    handleSaveSnippet,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();
  const hasSentencesAndWordsInTandem = sentencesForReviewMemoized?.length > 0;

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

  return (
    <TabsContent
      value='transcript'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      {hasSentencesAndWordsInTandem && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={sentencesForReviewMemoized}
        />
      )}
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
                breakdownSentencesArrState={breakdownSentencesArrState}
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
                setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
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
              >
                <TranscriptItem />
              </TranscriptItemProvider>
            </div>
          );
        })}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabTranscript;
