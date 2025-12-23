import { useEffect } from 'react';
import { Progress } from '../ui/progress';
import clsx from 'clsx';

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

const ProgressHeader = ({ progressState, progressText, small = false }) => {
  return (
    <div className='flex gap-2'>
      <Progress
        value={progressState}
        className={clsx(' my-auto', small ? 'w-7/12' : 'w-full')}
      />
      <span
        className='my-auto font-medium text-sm'
        data-testid='progress-header-text'
      >
        {progressText}
      </span>
    </div>
  );
};

export default ProgressHeader;
