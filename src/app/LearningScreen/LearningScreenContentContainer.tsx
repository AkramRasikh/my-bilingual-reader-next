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
    <div className='min-w-0 w-full flex-1 basis-0 xl:basis-auto xl:max-w-none xl:w-xl'>
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
