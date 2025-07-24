import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

const ProgressBarSnippet = ({
  snippetRef,
  threeSecondLoopState,
  progress,
  setProgress,
}) => {
  const startPoint = threeSecondLoopState - 1.5;

  useEffect(() => {
    const audio = snippetRef.current;

    const updateProgress = () => {
      if (audio) {
        const currentTime = audio.currentTime;
        const endRange = startPoint + 3;

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
  }, []);

  return (
    <div className='space-y-4 w-full max-w-xl'>
      <Progress value={progress} className='w-full' />
    </div>
  );
};

export default ProgressBarSnippet;
