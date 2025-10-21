import clsx from 'clsx';
import YouTubeUploadForm from './YoutubeUploadForm';
import YoutubeUploadIframe from './YoutubeUploadIframe';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import YoutubeUploadTranscript from './YoutubeUploadTranscript';

const YoutubeUploadContainer = () => {
  const { videoIsLoadedState, transcriptState, publicAudioUrlState } =
    useYoutubeUpload();

  console.log('## transcriptState', transcriptState);

  return (
    <div className={clsx(transcriptState ? 'flex flex-row' : '')}>
      <div
        className={clsx(
          videoIsLoadedState ? 'flex gap-2 ' : '',
          transcriptState ? 'flex-col' : '',
          'mx-auto',
        )}
      >
        <YouTubeUploadForm />
        {videoIsLoadedState && <YoutubeUploadIframe />}
      </div>
      {transcriptState && (
        <div className='mx-auto w-lg'>
          {publicAudioUrlState && (
            <div className='mx-auto my-2'>
              <audio
                src={publicAudioUrlState}
                controls
                className='w-full m-auto'
              />
            </div>
          )}
          <YoutubeUploadTranscript />
        </div>
      )}
    </div>
  );
};

export default YoutubeUploadContainer;
