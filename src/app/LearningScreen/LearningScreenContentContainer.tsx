import { Tabs } from '@/components/ui/tabs';
import LearningScreenTabMeta from './TabContent/LearningScreenTabMeta';
import LearningScreenTabSelection from './TabContent/LearningScreenTabSelection';
import useLearningScreen from './useLearningScreen';
import LearningScreenTabTranscript from './TabContent/LearningScreenTabTranscript';
import LearningScreenTabWords from './TabContent/LearningScreenTabWords';

const LearningScreenContentContainer = () => {
  const { selectedContentState } = useLearningScreen();

  const topicName = selectedContentState?.title;

  return (
    <div className='flex-1 w-xl'>
      <Tabs defaultValue='transcript'>
        <LearningScreenTabSelection topicName={topicName} />
        <LearningScreenTabTranscript />
        <LearningScreenTabWords />
        <LearningScreenTabMeta />
      </Tabs>
    </div>
  );
};

export default LearningScreenContentContainer;
