import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';

const LearningScreenTabs = ({ topicName }) => {
  const {
    wordsForSelectedTopic,
    contentMetaMemoized,
    contentMetaWordMemoized,
    isInReviewMode,
  } = useLearningScreen();
  const thisTopicHasWords = wordsForSelectedTopic?.length > 0;

  const hasUnifiedChapter = contentMetaMemoized?.length === 1;

  const WordsDue = contentMetaWordMemoized.length;

  const wordsText = hasUnifiedChapter
    ? `Words ${WordsDue}/${wordsForSelectedTopic.length}`
    : 'Words';

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
