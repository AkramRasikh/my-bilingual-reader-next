import LearningScreenWordCard from './LearningScreenWordCard';
import useLearningScreen from '../useLearningScreen';
import { TabsContent } from '@radix-ui/react-tabs';

const LearningScreenTabWords = () => {
  const { wordsForSelectedTopic } = useLearningScreen();

  return (
    <TabsContent
      value='words'
      className='max-h-130 min-w-0 overflow-x-hidden overflow-y-auto p-1 min-[1367px]:max-h-150'
    >
      <div className='m-auto w-full min-w-0 max-w-full p-1.5 text-center'>
        <ul className='flex w-full min-w-0 flex-wrap justify-center gap-2.5'>
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
