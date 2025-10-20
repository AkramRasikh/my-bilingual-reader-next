import clsx from 'clsx';
import { Button } from '@/components/ui/button';

const LoopBtn = ({
  threeSecondLoopState,
  setThreeSecondLoopState,
  contractThreeSecondLoopState,
  isVideoPlaying,
}) => {
  const startPoint =
    threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);

  const upToEndTime = startPoint + (contractThreeSecondLoopState ? 1.5 : 3);

  const loopLength = upToEndTime - startPoint;

  return (
    <Button
      id='stop-loop'
      onClick={() => setThreeSecondLoopState(null)}
      className={clsx(
        isVideoPlaying && 'animate-spin',
        'rounded-full h-9 w-9 relative inline-block my-2',
      )}
      size='icon'
      variant={'destructive'}
    >
      <span className='text-sm font-medium italic my-auto'>({loopLength})</span>
    </Button>
  );
};

export default LoopBtn;
