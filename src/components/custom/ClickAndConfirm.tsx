import LoadingSpinner from './LoadingSpinner';
import clsx from 'clsx';

const ClickAndConfirm = ({
  showConfirm,
  setShowConfirm,
  onClick,
  isLoadingState,
}) => {
  return (
    <div className='min-w-[180px]'>
      <button
        data-testid='delete-button'
        onClick={() => setShowConfirm(true)}
        className={clsx(
          'bg-red-500 text-white px-3 py-1 rounded w-fit my-1 text-xs',
          showConfirm ? 'hidden' : 'block',
        )}
      >
        Delete
      </button>
      <div
        className={clsx(
          'flex gap-2 my-1',
          showConfirm ? 'block' : 'hidden',
        )}
      >
        {isLoadingState && (
          <div
            data-testid='click-and-confirm-loading'
            className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'
          >
            <LoadingSpinner />
          </div>
        )}
        <button
          onClick={onClick}
          className='bg-red-600 text-white px-3 py-1 rounded text-xs'
        >
          Confirm Delete
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className='bg-gray-300 text-black px-3 py-1 rounded text-xs'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ClickAndConfirm;
