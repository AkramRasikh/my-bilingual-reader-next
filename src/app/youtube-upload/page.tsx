import PageContainer from '@/components/custom/PageContainer';
import YouTubeUploadForm from './YoutubeUploadForm';

export default function YoutubeUploadPage() {
  return (
    <PageContainer>
      <h1 className='text-center mb-3'>Youtube Media Uploads</h1>
      <YouTubeUploadForm />
    </PageContainer>
  );
}
