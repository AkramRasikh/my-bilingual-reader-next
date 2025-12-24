import { Tabs } from '@/components/ui/tabs';
import LearningScreenTabMeta from './TabContent/LearningScreenTabMeta';
import LearningScreenTabSelection from './TabContent/LearningScreenTabSelection';
import useLearningScreen from './useLearningScreen';
import LearningScreenTabTranscript from './TabContent/LearningScreenTabTranscript';
import LearningScreenTabWords from './TabContent/LearningScreenTabWords';
import { useFetchData } from '../Providers/FetchDataProvider';

const LearningScreenContentContainer = () => {
  const { updateContentMetaData } = useFetchData();
  const { selectedContentState } = useLearningScreen();

  const topicName = selectedContentState?.title;

  return (
    <div className='flex-1 w-xl'>
      <Tabs defaultValue='transcript'>
        <LearningScreenTabSelection topicName={topicName} />
        <LearningScreenTabTranscript />
        <LearningScreenTabWords />
        <LearningScreenTabMeta updateContentMetaData={updateContentMetaData} />
      </Tabs>
    </div>
  );
};

export default LearningScreenContentContainer;
