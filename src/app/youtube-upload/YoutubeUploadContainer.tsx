import clsx from 'clsx';
import YouTubeUploadForm from './YoutubeUploadForm';
import YoutubeUploadIframe from './YoutubeUploadIframe';
import { useYoutubeUpload } from './YoutubeUploadProvider';

const YoutubeUploadContainer = () => {
  const { videoIsLoadedState } = useYoutubeUpload();

  return (
    <div className={clsx(videoIsLoadedState ? 'flex gap-2 ' : '', 'm-auto')}>
      {videoIsLoadedState && <YoutubeUploadIframe />}
      <YouTubeUploadForm />
    </div>
  );
};

export default YoutubeUploadContainer;
