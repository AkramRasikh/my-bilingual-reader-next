'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ContentActionBar({
  hasContentToReview,
  handleBulkReviews,
}: {
  hasContentToReview: boolean;
  handleBulkReviews: (action: 'add' | 'remove') => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const action = hasContentToReview ? 'remove' : 'add';

  const handlePrimaryClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await handleBulkReviews(action);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className='flex flex-col items-center gap-2 mt-3'>
      <div className='flex gap-2'>
        <button
          onClick={handlePrimaryClick}
          disabled={isLoading}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {hasContentToReview ? 'Remove bulk review' : 'Add bulk review'}
        </button>
        {isLoading && <LoadingSpinner />}
      </div>

      {showConfirm && !isLoading && (
        <div className='flex gap-2 mt-2'>
          <button
            onClick={handleConfirm}
            className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700'
          >
            Confirm {action}
          </button>
          <button
            onClick={handleCancel}
            className='px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
