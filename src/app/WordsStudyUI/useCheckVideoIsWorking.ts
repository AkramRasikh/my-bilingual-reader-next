import { useEffect, useState } from 'react';

const useCheckVideoIsWorking = (ref) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = ref.current;

    if (!video) return;

    // Handle video load error
    const handleError = () => {
      const errorMessage =
        video.error?.message ||
        `Video failed to load (code: ${video.error?.code || 'unknown'})`;
      setError(errorMessage);
    };

    // Attach listener
    video.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      video.removeEventListener('error', handleError);
    };
  }, []);

  return error;
};

export default useCheckVideoIsWorking;
