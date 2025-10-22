import { useEffect } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';

const YoutubeUploadAudioEl = () => {
  const {
    youtubeMediaRef,
    publicAudioUrlState,
    handleTimeUpdate,
    setIsVideoPlaying,
  } = useYoutubeUpload();

  useEffect(() => {
    const video = youtubeMediaRef?.current;

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
    <div className='mx-auto my-2'>
      <audio
        ref={youtubeMediaRef}
        src={publicAudioUrlState}
        controls
        className='w-full m-auto'
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};

export default YoutubeUploadAudioEl;
