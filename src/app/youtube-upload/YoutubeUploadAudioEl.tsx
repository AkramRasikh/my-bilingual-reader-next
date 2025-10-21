import { useYoutubeUpload } from './YoutubeUploadProvider';

const YoutubeUploadAudioEl = () => {
  const { youtubeMediaRef, publicAudioUrlState, handleTimeUpdate } =
    useYoutubeUpload();

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
