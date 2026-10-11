import useLearningScreen from './useLearningScreen';
import { Button } from '@/components/ui/button';

const LearningScreenActionBar = () => {
  const { loopTranscriptState, handleBulkReviews } = useLearningScreen();

  const isLooping = loopTranscriptState?.length > 0;

  return (
    <div
      className='flex flex-col items-start gap-2 my-2 p-2'
      data-testid='learning-screen-action-bar'
    >
      {isLooping && (
        <div className='flex gap-2 flex-wrap'>
          <Button variant={'outline'} onClick={handleBulkReviews}>
            Loop ➡️ Review (shft + ⤶)
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningScreenActionBar;
