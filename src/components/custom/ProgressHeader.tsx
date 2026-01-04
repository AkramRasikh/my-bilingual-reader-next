import { useEffect } from 'react';
import { Progress } from '../ui/progress';
import clsx from 'clsx';

interface UseProgressHeaderProps {
  setProgressState: (value: number) => void;
  totalItems: number | null;
  remainingItems: number | null;
}

interface ProgressHeaderProps {
  progressState: number;
  progressText: string;
  small?: boolean;
}

export const useProgressHeader = ({
  setProgressState,
  totalItems,
  remainingItems,
}: UseProgressHeaderProps) => {
  useEffect(() => {
    if (totalItems === null || remainingItems === null) {
      return;
    }
    const progressValue = ((totalItems - remainingItems) / totalItems) * 100;

    setProgressState(progressValue);
  }, [remainingItems, totalItems, setProgressState]);
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
