import AnimationWrapper from '@/components/custom/AnimationWrapper';
import { useYoutubeUpload } from './YoutubeUploadProvider';

const YoutubeUploadIframe = () => {
  const { form, videoIsLoadedState } = useYoutubeUpload();
  const youtubeId = form?.url?.split('=')[1];

  return (
    <div className='mx-auto max-w-xl'>
      <p className='mb-1 text-center'>{videoIsLoadedState}</p>
      <AnimationWrapper>
        <iframe
          width='560'
          height='315'
          src={`https://www.youtube.com/embed/${youtubeId}`}
          frameborder='0'
          allowfullscreen
          className='rounded-2xl'
        />
      </AnimationWrapper>
    </div>
  );
};

export default YoutubeUploadIframe;
