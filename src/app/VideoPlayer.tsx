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

  return (
    <div className='flex flex-col'>
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
        <p className='text-center font-bold text-xl text-blue-900  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
          {masterPlayComprehensiveState.targetLang}
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;
