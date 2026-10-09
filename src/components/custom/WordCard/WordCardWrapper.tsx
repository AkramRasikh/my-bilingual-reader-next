import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';
import { LucideStar } from 'lucide-react';

const WordCardWrapper = ({ isLoadingState, id, isWordDue, children }) => (
  <div
    className={clsx(
      isLoadingState ? 'mask-b-from-gray-700' : '',
      'relative w-full min-w-0 max-w-full break-words rounded-2xl p-3',
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
