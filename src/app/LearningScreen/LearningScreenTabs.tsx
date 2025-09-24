import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import useData from '../useData';

const LearningScreenTabs = ({ topicName }) => {
  const { wordsForSelectedTopic } = useData();
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
