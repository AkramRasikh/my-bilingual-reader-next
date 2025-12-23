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
      <TabsTrigger value='transcript' data-testid='transcript-tab-trigger'>Transcript</TabsTrigger>
      <TabsTrigger value='comprehensive' disabled={!isInReviewMode} data-testid='comprehensive-tab-trigger'>
        Comprehensive
      </TabsTrigger>
      <TabsTrigger value='words' disabled={!thisTopicHasWords} data-testid='words-tab-trigger'>
        {wordsText}
      </TabsTrigger>
      {topicName && <TabsTrigger value='meta' data-testid='meta-tab-trigger'>Meta</TabsTrigger>}
    </TabsList>
  );
};

export default LearningScreenTabs;
