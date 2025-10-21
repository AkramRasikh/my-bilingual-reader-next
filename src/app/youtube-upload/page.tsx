'use client';

import PageContainer from '@/components/custom/PageContainer';
import { YoutubeUploadProvider } from './YoutubeUploadProvider';
import YoutubeUploadContainer from './YoutubeUploadContainer';

export default function YoutubeUploadPage() {
  return (
    <PageContainer>
      <YoutubeUploadProvider>
        <h1 className='text-center mb-3'>Youtube Media Uploads</h1>
        <YoutubeUploadContainer />
      </YoutubeUploadProvider>
    </PageContainer>
  );
}
