import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

const LoopIndicatorWithProgress = ({
  ref,
  threeSecondLoopState,
  progress,
  setProgress,
  contractThreeSecondLoopState,
}) => {
  const startPoint =
    threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);

  useEffect(() => {
    const audio = ref.current;

    const updateProgress = () => {
      if (audio) {
        const currentTime = audio.currentTime;
        const endRange = startPoint + (contractThreeSecondLoopState ? 1.5 : 3);

        const progressValue =
          ((currentTime - startPoint) / (endRange - startPoint)) * 100;

        setProgress(progressValue);
      }
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      // Clean up on unmount
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [threeSecondLoopState, contractThreeSecondLoopState]);

  return (
    <div
      data-testid='loop-indicator-progress'
      className='flex gap-3 justify-center my-1 animate-pulse'
    >
      <Progress value={progress} className='h-1 w-full [&>div]:bg-red-600' />
    </div>
  );
};

export default LoopIndicatorWithProgress;
