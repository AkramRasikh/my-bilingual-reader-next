import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';

const LearningScreenTabs = ({ topicName }) => {
  const { wordsForSelectedTopic, contentMetaWordMemoized, isInReviewMode } =
    useLearningScreen();
  const thisTopicHasWords = wordsForSelectedTopic?.length > 0;

  const WordsDue = contentMetaWordMemoized.length;

  const wordsText = `Words ${WordsDue}/${wordsForSelectedTopic.length}`;

  return (
    <TabsList>
      <TabsTrigger value='transcript'>Transcript</TabsTrigger>
      <TabsTrigger value='comprehensive' disabled={!isInReviewMode}>
        Comprehensive
      </TabsTrigger>
      <TabsTrigger value='words' disabled={!thisTopicHasWords}>
        {wordsText}
      </TabsTrigger>
      {topicName && <TabsTrigger value='meta'>Meta</TabsTrigger>}
    </TabsList>
  );
};

export default LearningScreenTabs;
