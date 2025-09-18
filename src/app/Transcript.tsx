import TranscriptItem from './TranscriptItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WordDialogueContent } from './WordContainerDialogue';
import { TabMetaContentData } from './ContentActionBar';

const Transcript = ({
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
  const thisTopicHasWords = wordsForSelectedTopic?.length > 0;
  return (
    <div className='flex-1 max-w-xl'>
      <div>
        {hasPreviousVideo && (
          <button
            className='m-auto flex p-2.5'
            onClick={() => {
              getNextTranscript();
              setSecondsState();
            }}
          >
            ⏫⏫⏫⏫⏫
          </button>
        )}
        <Tabs defaultValue='transcript'>
          <TabsList>
            <TabsTrigger value='transcript'>Transcript</TabsTrigger>
            <TabsTrigger value='words' disabled={!thisTopicHasWords}>
              Words {wordsForSelectedTopic.length}
            </TabsTrigger>
            {topicName && <TabsTrigger value='meta'>Meta</TabsTrigger>}
          </TabsList>

          <TabsContent value='transcript'>
            <ul
              className='border rounded-lg p-1'
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                margin: 'auto',
                overflow: 'scroll',
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              {formattedTranscriptState.map((contentItem, index) => {
                return (
                  <TranscriptItem
                    key={index}
                    isGenericItemLoadingState={isGenericItemLoadingState}
                    contentItem={contentItem}
                    isVideoPlaying={isVideoPlaying}
                    handlePause={handlePause}
                    handleFromHere={handleFromHere}
                    masterPlay={masterPlay}
                    handleReviewFunc={handleReviewFunc}
                    handleBreakdownSentence={handleBreakdownSentence}
                    sentenceHighlightingState={sentenceHighlightingState}
                    setSentenceHighlightingState={setSentenceHighlightingState}
                    handleOpenBreakdownSentence={handleOpenBreakdownSentence}
                    breakdownSentencesArrState={breakdownSentencesArrState}
                    setBreakdownSentencesArrState={
                      setBreakdownSentencesArrState
                    }
                    isPressDownShiftState={isPressDownShiftState}
                    loopTranscriptState={loopTranscriptState}
                    setLoopTranscriptState={setLoopTranscriptState}
                    overlappingSnippetDataState={overlappingSnippetDataState}
                    threeSecondLoopState={threeSecondLoopState}
                    isInReviewMode={isInReviewMode}
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
        <div>
          {hasFollowingVideo && (
            <button
              className='m-auto flex p-2.5'
              onClick={() => {
                getNextTranscript(true);
                setSecondsState();
              }}
            >
              ⏬⏬⏬⏬⏬
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;
