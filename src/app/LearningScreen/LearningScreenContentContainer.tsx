import TranscriptItem from '../TranscriptItem';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { WordDialogueContent } from '../WordContainerDialogue';
import { TabMetaContentData } from '../ContentActionBar';
import LearningScreenTabs from './LearningScreenTabs';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';

const LearningScreenContentContainer = ({
  hasPreviousVideo,
  hasFollowingVideo,
  getNextTranscript,
  setSecondsState,
  formattedTranscriptState,
  isVideoPlaying,
  handlePause,
  handleFromHere,
  masterPlay,
  handleReviewFunc,
  handleBreakdownSentence,
  sentenceHighlightingState,
  setSentenceHighlightingState,
  isGenericItemLoadingState,
  breakdownSentencesArrState,
  handleOpenBreakdownSentence,
  setBreakdownSentencesArrState,
  isPressDownShiftState,
  loopTranscriptState,
  setLoopTranscriptState,
  overlappingSnippetDataState,
  threeSecondLoopState,
  isInReviewMode,
  addWordToBasket,
  wordsForSelectedTopic,
  hasContentToReview,
  handleBulkReviews,
  reviewHistory,
  updateContentMetaData,
  topicName,
  contentIndex,
}) => {
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
          className='border rounded-lg p-1 max-h-150 overflow-y-auto'
        >
          <ul className='flex flex-col gap-1'>
            {formattedTranscriptState.map((contentItem, index) => {
              return (
                <TranscriptItem
                  key={index}
                  contentItem={contentItem}
                  handleFromHere={handleFromHere}
                  handlePause={handlePause}
                  // isGenericItemLoadingState={isGenericItemLoadingState}
                  // isVideoPlaying={isVideoPlaying}
                  // handleFromHere={handleFromHere}
                  // masterPlay={masterPlay}
                  // handleReviewFunc={handleReviewFunc}
                  // handleBreakdownSentence={handleBreakdownSentence}
                  // sentenceHighlightingState={sentenceHighlightingState}
                  // setSentenceHighlightingState={setSentenceHighlightingState}
                  // handleOpenBreakdownSentence={handleOpenBreakdownSentence}
                  // breakdownSentencesArrState={breakdownSentencesArrState}
                  // setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                  // isPressDownShiftState={isPressDownShiftState}
                  // loopTranscriptState={loopTranscriptState}
                  // setLoopTranscriptState={setLoopTranscriptState}
                  // overlappingSnippetDataState={overlappingSnippetDataState}
                  // threeSecondLoopState={threeSecondLoopState}
                  // isInReviewMode={isInReviewMode}
                />
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value='words'>
          <div
            style={{
              overflow: 'scroll',
              maxHeight: '600px',
            }}
          >
            <WordDialogueContent
              addWordToBasket={addWordToBasket}
              wordsForSelectedTopic={wordsForSelectedTopic}
            />
          </div>
        </TabsContent>
        {topicName && (
          <TabsContent value='meta'>
            <TabMetaContentData
              hasContentToReview={hasContentToReview}
              handleBulkReviews={handleBulkReviews}
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
