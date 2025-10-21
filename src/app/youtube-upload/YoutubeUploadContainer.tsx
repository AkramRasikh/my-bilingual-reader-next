import clsx from 'clsx';
import YouTubeUploadForm from './YoutubeUploadForm';
import YoutubeUploadIframe from './YoutubeUploadIframe';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import YoutubeUploadTranscript from './YoutubeUploadTranscript';
import YoutubeUploadAudioEl from './YoutubeUploadAudioEl';

const YoutubeUploadContainer = () => {
  const { videoIsLoadedState, transcriptState, publicAudioUrlState } =
    useYoutubeUpload();

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
          {publicAudioUrlState && <YoutubeUploadAudioEl />}
          <YoutubeUploadTranscript />
        </div>
      )}
    </div>
  );
};

export default YoutubeUploadContainer;
