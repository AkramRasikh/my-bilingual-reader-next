import { useEffect } from 'react';

const AudioPlayer = ({
  ref,
  audioUrl,
  setIsVideoPlaying,
  handleTimeUpdate,
  onLoadedMetadata,
}) => {
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
    <div>
      <div className='flex gap-3 mb-2'>
        <audio
          ref={ref}
          src={audioUrl}
          controls
          className='w-full'
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
