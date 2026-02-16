import LearningScreenWordCard from './LearningScreenWordCard';
import useLearningScreen from '../useLearningScreen';
import { TabsContent } from '@radix-ui/react-tabs';

const LearningScreenTabWords = () => {
  const { wordsForSelectedTopic } = useLearningScreen();

  return (
    <TabsContent value='words' className={'p-1 max-h-150 overflow-y-auto'}>
      <div className='text-center m-auto p-1.5'>
        <ul className='flex flex-wrap gap-2.5 justify-center'>
          {wordsForSelectedTopic.map((word, index) => (
            <LearningScreenWordCard
              key={word.id}
              word={word}
              indexNum={index + 1}
              isReadyForQuickReview={false}
            />
          ))}
        </ul>
      </div>
    </TabsContent>
  );
};

export default LearningScreenTabWords;
