import clsx from 'clsx';
import { Button } from '@/components/ui/button';

import useLearningScreen from './useLearningScreen';

const LearningScreenLoopBtn = () => {
  const {
    threeSecondLoopState,
    setThreeSecondLoopState,
    contractThreeSecondLoopState,
    isVideoPlaying,
  } = useLearningScreen();

  const startPoint =
    threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);

  const upToEndTime = startPoint + (contractThreeSecondLoopState ? 1.5 : 3);

  const loopLength = upToEndTime - startPoint;

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
