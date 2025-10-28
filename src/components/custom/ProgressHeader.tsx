import { Progress } from '../ui/progress';

const ProgressHeader = ({ progressState, progressText }) => {
  return (
    <div className='flex gap-2'>
      <Progress value={progressState} className='w-full my-auto' />
      <span className='my-auto font-medium text-sm'>{progressText}</span>
    </div>
  );
};

export default ProgressHeader;
