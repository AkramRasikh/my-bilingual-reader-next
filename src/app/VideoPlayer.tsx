'use client';
import { useEffect } from 'react';

const VideoPlayer = ({
  url,
  ref,
  handleTimeUpdate,
  setIsVideoPlaying,
  masterPlayComprehensiveState,
}) => {
  const videoUrl = url;

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  {
    /* <div className='flex justify-center items-center h-screen'> */
  }
  return (
    <div className='relative'>
      <video
        ref={ref}
        src={videoUrl}
        controls
        className='w-full rounded-lg shadow-lg m-auto'
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the video tag.
      </video>
      {masterPlayComprehensiveState?.targetLang && (
        <p
          className='text-center absolute bottom-1/7 w-11/12 p-1.5  font-bold text-xl text-blue-100 [text-shadow:_2px_2px_6px_rgba(0,0,0,0.8)]'
          style={{
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {masterPlayComprehensiveState.targetLang}
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;
