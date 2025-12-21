import clsx from 'clsx';
import { Button } from '@/components/ui/button';

import useLearningScreen from './useLearningScreen';

const LearningScreenLoopBtn = () => {
  const {
    setThreeSecondLoopState,
    contractThreeSecondLoopState,
    isVideoPlaying,
  } = useLearningScreen();

  const loopLength = contractThreeSecondLoopState ? 1.5 : 3;

  return (
    <Button
      id='stop-loop'
      data-testid='stop-loop'
      onClick={() => setThreeSecondLoopState(null)}
      className={clsx(
        isVideoPlaying && 'animate-spin',
        'rounded-full h-9 w-9 relative inline-block my-auto',
      )}
      size='icon'
      variant={'destructive'}
    >
      <span className='text-sm font-medium italic my-auto'>({loopLength})</span>
    </Button>
  );
};

export default LearningScreenLoopBtn;
