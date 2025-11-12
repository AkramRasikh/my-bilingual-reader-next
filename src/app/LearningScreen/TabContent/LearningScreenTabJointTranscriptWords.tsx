import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';

const LearningScreenTabJointTranscriptWords = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    setSentenceHighlightingState,
    sentenceHighlightingState,
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
    latestDueIdState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
    sentencesWithinInterval,
    transcriptsWithinInterval,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <TabsContent
      value='comprehensive'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      {sentencesWithinInterval.length > 0 && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={sentencesWithinInterval}
          withToggle={false}
        />
      )}
      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {transcriptsWithinInterval?.map((contentItem, index) => {
          return (
            <div key={index}>
              <TranscriptItemProvider
                indexNum={index}
                threeSecondLoopState={threeSecondLoopState}
                overlappingSnippetDataState={overlappingSnippetDataState}
                setSentenceHighlightingState={setSentenceHighlightingState}
                sentenceHighlightingState={sentenceHighlightingState}
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
                latestDueIdState={latestDueIdState}
                scrollToElState={scrollToElState}
                wordsForSelectedTopic={wordsForSelectedTopic}
                languageSelectedState={languageSelectedState}
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

export default LearningScreenTabJointTranscriptWords;
