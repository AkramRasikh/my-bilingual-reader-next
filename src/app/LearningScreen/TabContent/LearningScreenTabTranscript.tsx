import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import useData from '../../Providers/useData';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';

const LearningScreenTabTranscript = () => {
  const {
    formattedTranscriptState,
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
    firstDueIndexMemoized,
    studyFromHereTimeState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const learnFormattedTranscript =
    isInReviewMode && latestDueIdState?.id
      ? formattedTranscriptState.slice(
          firstDueIndexMemoized,
          latestDueIdState?.index + 1,
        )
      : studyFromHereTimeState
      ? formattedTranscriptState.slice(studyFromHereTimeState)
      : formattedTranscriptState;

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <TabsContent
      value='transcript'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {learnFormattedTranscript.map((contentItem, index) => (
          <TranscriptItemProvider
            key={index}
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
        ))}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabTranscript;
