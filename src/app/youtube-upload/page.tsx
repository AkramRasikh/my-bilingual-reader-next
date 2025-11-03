'use client';

import { YoutubeUploadProvider } from './YoutubeUploadProvider';
import YoutubeUploadContainer from './YoutubeUploadContainer';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';

export default function YoutubeUploadPage() {
  const router = useRouter();

  return (
    <div className='p-4 bg-amber-50 h-lvh'>
      <YoutubeUploadProvider>
        <BreadCrumbHeaderBase
          onClick={() => router.push('/')}
          heading={'Home'}
          subHeading={'Youtube Media Uploads'}
          withBasket={false}
        />

        <YoutubeUploadContainer />
      </YoutubeUploadProvider>
    </div>
  );
}
