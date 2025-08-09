'use client';
import { useEffect } from 'react';

const VideoPlayer = ({ url, ref, handleTimeUpdate, setIsVideoPlaying }) => {
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
    <video
      ref={ref}
      src={videoUrl}
      controls
      className='w-full rounded-lg shadow-lg m-auto'
      onTimeUpdate={handleTimeUpdate}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
