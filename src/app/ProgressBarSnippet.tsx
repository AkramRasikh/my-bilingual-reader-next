import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

const ProgressBarSnippet = ({
  snippetRef,
  threeSecondLoopState,
  progress,
  setProgress,
  contractThreeSecondLoopState,
}) => {
  const startPoint =
    threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);

  const upToEndTime = startPoint + (contractThreeSecondLoopState ? 1.5 : 3);

  const loopLength = upToEndTime - startPoint;

  useEffect(() => {
    const audio = snippetRef.current;

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
    <div className='space-y-4 w-full max-w-xl m-auto'>
      <span>
        {startPoint.toFixed(2)} ➡️ {upToEndTime.toFixed(2)} (Loop length){' '}
        {loopLength}
      </span>
      <Progress value={progress} className='w-full' />
    </div>
  );
};

export default ProgressBarSnippet;
