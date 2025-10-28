import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';

const WordCardWrapper = ({ isLoadingState, isWordDue, children }) => (
  <div
    className={clsx(
      isWordDue ? 'bg-amber-100' : 'bg-gray-50',
      isLoadingState ? 'mask-b-from-gray-700' : '',
      'w-fit p-3 relative rounded-2xl min-w-md',
    )}
  >
    {isLoadingState && (
      <div className='absolute left-5/10 top-1/3'>
        <LoadingSpinner />
      </div>
    )}
    {children}
  </div>
);

export default WordCardWrapper;
