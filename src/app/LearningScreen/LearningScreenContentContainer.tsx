import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabMetaContentData } from '../ContentActionBar';
import LearningScreenTabSelection from './LearningScreenTabSelection';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';
import useLearningScreen from './useLearningScreen';
import useData from '../Providers/useData';
import LearningScreenTabContent from './LearningScreenTabContent';
import LearningScreenTabWords from './LearningScreenTabWords';

const LearningScreenContentContainer = () => {
  const { updateContentMetaData } = useData();
  const { getNextTranscript, selectedContentState } = useLearningScreen();

  const isFullReview = selectedContentState?.isFullReview;

  const contentIndex = selectedContentState?.contentIndex;

  const reviewHistory = selectedContentState?.reviewHistory;

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = selectedContentState.hasFollowingVideo;

  const topicName = !isFullReview && selectedContentState?.title;

  const { setSecondsState } = useLearningScreen();

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <LearningScreenChapterToggleWrapper
      hasPreviousVideo={hasPreviousVideo}
      hasFollowingVideo={hasFollowingVideo}
      getNextTranscript={getNextTranscript}
      setSecondsState={setSecondsState}
    >
      <Tabs defaultValue='transcript'>
        <LearningScreenTabSelection topicName={topicName} />
        <LearningScreenTabContent />
        <LearningScreenTabWords />
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
