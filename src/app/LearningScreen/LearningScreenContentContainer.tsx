import clsx from 'clsx';
import TranscriptItem from '../TranscriptItem';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { WordDialogueContent } from '../WordContainerDialogue';
import { TabMetaContentData } from '../ContentActionBar';
import LearningScreenTabs from './LearningScreenTabs';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';
import useLearningScreen from './useLearningScreen';

const LearningScreenContentContainer = ({
  hasPreviousVideo,
  hasFollowingVideo,
  getNextTranscript,
  setSecondsState,
  hasContentToReview,
  handleBulkReviews,
  reviewHistory,
  updateContentMetaData,
  topicName,
  contentIndex,
}) => {
  const { formattedTranscriptState } = useLearningScreen();
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
              <TranscriptItem key={index} contentItem={contentItem} />
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
