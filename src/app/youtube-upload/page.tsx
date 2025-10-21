import PageContainer from '@/components/custom/PageContainer';
import YouTubeUploadForm from './YoutubeUploadForm';
import { YoutubeUploadProvider } from './YoutubeUploadProvider';

export default function YoutubeUploadPage() {
  return (
    <PageContainer>
      <YoutubeUploadProvider>
        <h1 className='text-center mb-3'>Youtube Media Uploads</h1>
        <YouTubeUploadForm />
      </YoutubeUploadProvider>
    </PageContainer>
  );
}
