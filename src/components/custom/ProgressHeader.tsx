import { useEffect } from 'react';
import { Progress } from '../ui/progress';

export const useProgressHeader = ({
  setProgressState,
  initNumState,
  currentStateNumber,
}) => {
  useEffect(() => {
    if (!initNumState || !currentStateNumber) {
      return;
    }
    const progressValue =
      ((initNumState - currentStateNumber) / initNumState) * 100;

    setProgressState(progressValue);
  }, [currentStateNumber, initNumState]);
};

const ProgressHeader = ({ progressState, progressText }) => {
  return (
    <div className='flex gap-2'>
      <Progress value={progressState} className='w-full my-auto' />
      <span className='my-auto font-medium text-sm'>{progressText}</span>
    </div>
  );
};

export default ProgressHeader;
