import { Button } from '@/components/ui/button';
import ProgressBarSnippet from '../ProgressBarSnippet';
import clsx from 'clsx';
import { Repeat2 } from 'lucide-react';
import useLearningScreen from './useLearningScreen';

const LearningScreenLoopUI = () => {
  const {
    ref,
    threeSecondLoopState,
    setThreeSecondLoopState,
    progress,
    setProgress,
    contractThreeSecondLoopState,
    isVideoPlaying,
  } = useLearningScreen();

  return (
    <div className='pt-1.5 m-auto flex justify-center gap-1.5 w-80'>
      <ProgressBarSnippet
        snippetRef={ref}
        threeSecondLoopState={threeSecondLoopState}
        progress={progress}
        setProgress={setProgress}
        contractThreeSecondLoopState={contractThreeSecondLoopState}
      />
      <Button
        id='stop-loop'
        onClick={() => setThreeSecondLoopState(null)}
        className={clsx(isVideoPlaying && 'animate-spin')}
        size='icon'
        variant={'destructive'}
      >
        <Repeat2 />
      </Button>
    </div>
  );
};

export default LearningScreenLoopUI;
