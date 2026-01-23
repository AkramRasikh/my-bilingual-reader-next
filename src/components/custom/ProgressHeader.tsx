import { Progress } from '../ui/progress';
import clsx from 'clsx';

interface ProgressHeaderProps {
  progressState: number;
  progressText: string;
  small?: boolean;
}

const ProgressHeader = ({
  progressState,
  progressText,
  small = false,
}: ProgressHeaderProps) => {
  return (
    <div className='flex gap-2 justify-center' data-testid='progress-header'>
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
