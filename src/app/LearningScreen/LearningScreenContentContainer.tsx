import { Tabs } from '@/components/ui/tabs';
import LearningScreenTabMeta from './TabContent/LearningScreenTabMeta';
import LearningScreenTabSelection from './TabContent/LearningScreenTabSelection';
import useLearningScreen from './useLearningScreen';
import LearningScreenTabTranscript from './TabContent/LearningScreenTabTranscript';
import LearningScreenTabWords from './TabContent/LearningScreenTabWords';
import { useFetchData } from '../Providers/FetchDataProvider';
import LearningScreenTabJointTranscriptWords from './TabContent/LearningScreenTabJointTranscriptWords';

const LearningScreenContentContainer = () => {
  const { updateContentMetaData } = useFetchData();
  const { selectedContentState, isInReviewMode } = useLearningScreen();

  const isFullReview = selectedContentState?.isFullReview;

  const topicName = !isFullReview && selectedContentState?.title;

  return (
    <div className='flex-1 w-xl'>
      <Tabs defaultValue='transcript'>
        <LearningScreenTabSelection topicName={topicName} />
        <LearningScreenTabTranscript />
        {isInReviewMode && <LearningScreenTabJointTranscriptWords />}
        <LearningScreenTabWords />
        {topicName && (
          <LearningScreenTabMeta
            updateContentMetaData={updateContentMetaData}
          />
        )}
      </Tabs>
    </div>
  );
};

export default LearningScreenContentContainer;
