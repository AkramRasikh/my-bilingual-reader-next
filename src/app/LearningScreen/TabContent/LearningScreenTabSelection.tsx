import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';

const LearningScreenTabs = ({ topicName }) => {
  const { wordsForSelectedTopic } = useLearningScreen();
  const thisTopicHasWords = wordsForSelectedTopic?.length > 0;

  return (
    <TabsList>
      <TabsTrigger value='transcript'>Transcript</TabsTrigger>
      <TabsTrigger value='words' disabled={!thisTopicHasWords}>
        Words {wordsForSelectedTopic.length}
      </TabsTrigger>
      {topicName && <TabsTrigger value='meta'>Meta</TabsTrigger>}
    </TabsList>
  );
};

export default LearningScreenTabs;
