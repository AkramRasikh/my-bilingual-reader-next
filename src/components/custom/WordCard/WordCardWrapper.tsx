import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';
import { LucideStar } from 'lucide-react';

const WordCardWrapper = ({ isLoadingState, id, isWordDue, children }) => (
  <div
    className={clsx(
      isLoadingState ? 'mask-b-from-gray-700' : '',
      'w-fit p-3 relative rounded-2xl min-w-md',
    )}
    data-testid={`word-card-wrapper-${id}`}
  >
    {isWordDue && (
      <div className='absolute left-0 top-0'>
        <LucideStar size={14} fill='gold' />
      </div>
    )}
    {isLoadingState && (
      <div className='absolute left-5/10 top-1/3'>
        <LoadingSpinner />
      </div>
    )}
    {children}
  </div>
);

export default WordCardWrapper;
