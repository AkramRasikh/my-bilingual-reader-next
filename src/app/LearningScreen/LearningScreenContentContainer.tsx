import clsx from 'clsx';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { WordDialogueContent } from '../WordContainerDialogue';
import { TabMetaContentData } from '../ContentActionBar';
import LearningScreenTabs from './LearningScreenTabs';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';
import useLearningScreen from './useLearningScreen';
import useData from '../useData';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';

const LearningScreenContentContainer = () => {
  const {
    updateContentMetaData,
    getNextTranscript,
    selectedContentState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    wordsState,
    breakdownSentence,
  } = useData();

  const isFullReview = selectedContentState?.isFullReview;

  const content = selectedContentState.content;
  const contentIndex = selectedContentState?.contentIndex;

  const reviewHistory = selectedContentState?.reviewHistory;
  const hasContentToReview = content?.some(
    (sentenceWidget) => sentenceWidget?.reviewData,
  );
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
    isInReviewMode,
    onlyShowEngState,
    setLoopTranscriptState,
    handleReviewFunc,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    handleBreakdownSentence,
  } = useLearningScreen();

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
          <ul className='flex flex-col gap-1'>
            {formattedTranscriptState.map((contentItem, index) => (
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
                handleReviewFunc={handleReviewFunc}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleFromHere={handleFromHere}
                handleBreakdownSentence={handleBreakdownSentence}
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
              hasContentToReview={hasContentToReview}
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
