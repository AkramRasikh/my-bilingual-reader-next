import { useEffect } from 'react';

const useCheckVideoIsWorking = (ref, setError) => {
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
};

export default useCheckVideoIsWorking;
