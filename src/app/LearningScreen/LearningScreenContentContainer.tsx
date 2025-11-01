import { Tabs } from '@/components/ui/tabs';
import LearningScreenTabMeta from './TabContent/LearningScreenTabMeta';
import LearningScreenTabSelection from './TabContent/LearningScreenTabSelection';
import LearningScreenChapterToggleWrapper from './LearningScreenChapterToggleWrapper';
import useLearningScreen from './useLearningScreen';
import LearningScreenTabTranscript from './TabContent/LearningScreenTabTranscript';
import LearningScreenTabWords from './TabContent/LearningScreenTabWords';
import { useFetchData } from '../Providers/FetchDataProvider';

const LearningScreenContentContainer = () => {
  const { updateContentMetaData } = useFetchData();
  const { getNextTranscript, selectedContentState } = useLearningScreen();

  const isFullReview = selectedContentState?.isFullReview;

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = selectedContentState.hasFollowingVideo;

  const topicName = !isFullReview && selectedContentState?.title;

  return (
    <LearningScreenChapterToggleWrapper
      hasPreviousVideo={hasPreviousVideo}
      hasFollowingVideo={hasFollowingVideo}
      getNextTranscript={getNextTranscript}
    >
      <Tabs defaultValue='transcript'>
        <LearningScreenTabSelection topicName={topicName} />
        <LearningScreenTabTranscript />
        <LearningScreenTabWords />
        {topicName && (
          <LearningScreenTabMeta
            updateContentMetaData={updateContentMetaData}
          />
        )}
      </Tabs>
    </LearningScreenChapterToggleWrapper>
  );
};

export default LearningScreenContentContainer;
