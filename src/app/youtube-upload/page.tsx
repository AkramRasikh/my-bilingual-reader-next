'use client';

import PageContainer from '@/components/custom/PageContainer';
import { YoutubeUploadProvider } from './YoutubeUploadProvider';
import YoutubeUploadContainer from './YoutubeUploadContainer';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';

export default function YoutubeUploadPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <YoutubeUploadProvider>
        <BreadCrumbHeaderBase
          onClick={() => router.push('/')}
          heading={'Home'}
          subHeading={'Youtube Media Uploads'}
          withBasket={false}
        />

        <YoutubeUploadContainer />
      </YoutubeUploadProvider>
    </PageContainer>
  );
}
