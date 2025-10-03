import clsx from 'clsx';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { WordDialogueContent } from '../WordContainerDialogue';
import { TabMetaContentData } from '../ContentActionBar';
import LearningScreenTabs from './LearningScreenTabs';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';
import useLearningScreen from './useLearningScreen';
import useData from '../Providers/useData';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';

const LearningScreenContentContainer = () => {
  const {
    updateContentMetaData,

    handleSaveWord,
    handleDeleteWordDataProvider,
    wordsState,
  } = useData();
  const { getNextTranscript, selectedContentState } = useLearningScreen();

  const isFullReview = selectedContentState?.isFullReview;

  const contentIndex = selectedContentState?.contentIndex;

  const reviewHistory = selectedContentState?.reviewHistory;

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = selectedContentState.hasFollowingVideo;

  const topicName = !isFullReview && selectedContentState?.title;

  const {
    formattedTranscriptState,
    setSecondsState,
    threeSecondLoopState,
    overlappingSnippetDataState,
    setSentenceHighlightingState,
    sentenceHighlightingState,
    isPressDownShiftState,
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
    firstDueIndexState,
    studyFromHereTimeState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
  } = useLearningScreen();

  const learnFormattedTranscript =
    isInReviewMode && latestDueIdState?.id
      ? formattedTranscriptState.slice(
          firstDueIndexState,
          latestDueIdState?.index + 1,
        )
      : studyFromHereTimeState
      ? formattedTranscriptState.slice(studyFromHereTimeState)
      : formattedTranscriptState;

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <LearningScreenChapterToggleWrapper
      hasPreviousVideo={hasPreviousVideo}
      hasFollowingVideo={hasFollowingVideo}
      getNextTranscript={getNextTranscript}
      setSecondsState={setSecondsState}
    >
      <Tabs defaultValue='transcript'>
        <LearningScreenTabs topicName={topicName} />
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
                threeSecondLoopState={threeSecondLoopState}
                overlappingSnippetDataState={overlappingSnippetDataState}
                setSentenceHighlightingState={setSentenceHighlightingState}
                sentenceHighlightingState={sentenceHighlightingState}
                contentItem={contentItem}
                isPressDownShiftState={isPressDownShiftState}
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
              >
                <TranscriptItem />
              </TranscriptItemProvider>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value='words' className={contentClasses}>
          <WordDialogueContent />
        </TabsContent>
        {topicName && (
          <TabsContent value='meta' className={contentClasses}>
            <TabMetaContentData
              reviewHistory={reviewHistory}
              updateContentMetaData={updateContentMetaData}
              topicName={topicName}
              contentIndex={contentIndex}
            />
          </TabsContent>
        )}
      </Tabs>
    </LearningScreenChapterToggleWrapper>
  );
};

export default LearningScreenContentContainer;
