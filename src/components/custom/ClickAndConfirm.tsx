import LoadingSpinner from './LoadingSpinner';

const ClickAndConfirm = ({
  showConfirm,
  setShowConfirm,
  onClick,
  isLoadingState,
}) => {
  return !showConfirm ? (
    <button
      onClick={() => setShowConfirm(true)}
      className='bg-red-500 text-white px-3 py-1 rounded w-fit my-1 text-xs'
    >
      Delete
    </button>
  ) : (
    <div className='flex gap-2 my-1'>
      {isLoadingState && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
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
  );
};

export default ClickAndConfirm;
