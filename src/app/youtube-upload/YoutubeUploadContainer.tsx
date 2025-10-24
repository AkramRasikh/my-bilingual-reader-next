import clsx from 'clsx';
import YouTubeUploadForm from './YoutubeUploadForm';
import YoutubeUploadIframe from './YoutubeUploadIframe';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import YoutubeUploadTranscriptActions from './YoutubeUploadTranscriptActions';
import YoutubeUploadTranscript from './YoutubeUploadTranscript';
import YoutubeUploadAudioEl from './YoutubeUploadAudioEl';

const YoutubeUploadContainer = () => {
  const { videoTitleState, transcriptState, publicAudioUrlState } =
    useYoutubeUpload();

  const hasTranscript = transcriptState?.length > 0;

  return (
    <div
      className={clsx(
        videoTitleState || hasTranscript
          ? 'flex flex-row justify-center gap-5'
          : '',
      )}
    >
      <div
        className={clsx(
          videoTitleState ? 'flex gap-2 ' : '',
          hasTranscript ? 'flex-col' : 'mx-auto',
        )}
      >
        <YouTubeUploadForm />
        {videoTitleState && <YoutubeUploadIframe />}
      </div>
      {hasTranscript && (
        <div className={clsx('w-lg', hasTranscript ? '' : 'mx-auto')}>
          <YoutubeUploadTranscriptActions />
          {publicAudioUrlState && <YoutubeUploadAudioEl />}
          <YoutubeUploadTranscript />
        </div>
      )}
    </div>
  );
};

export default YoutubeUploadContainer;
