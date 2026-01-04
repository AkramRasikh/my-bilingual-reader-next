import { useEffect } from 'react';
import { Progress } from '../ui/progress';
import clsx from 'clsx';

interface UseProgressHeaderProps {
  setProgressState: (value: number) => void;
  initNumState: number | null;
  currentStateNumber: number | null;
}

interface ProgressHeaderProps {
  progressState: number;
  progressText: string;
  small?: boolean;
}

export const useProgressHeader = ({
  setProgressState,
  initNumState,
  currentStateNumber,
}: UseProgressHeaderProps) => {
  useEffect(() => {
    if (!initNumState || !currentStateNumber) {
      return;
    }
    const progressValue =
      ((initNumState - currentStateNumber) / initNumState) * 100;

    setProgressState(progressValue);
  }, [currentStateNumber, initNumState]);
};

const ProgressHeader = ({
  progressState,
  progressText,
  small = false,
}: ProgressHeaderProps) => {
  return (
    <div className='flex gap-2' data-testid='progress-header'>
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
