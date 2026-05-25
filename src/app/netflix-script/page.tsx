'use client';

import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';
import NetflixScript from './NetflixScript';

export default function NetflixScriptPage() {
  const router = useRouter();

  return (
    <div className='min-h-lvh bg-amber-50 p-4'>
      <BreadCrumbHeaderBase
        onClick={() => router.push('/')}
        heading='Home'
        subHeading='Netflix Script'
        withBasket={false}
      />
      <NetflixScript />
    </div>
  );
}
