import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import { BookCheck } from 'lucide-react';

const LandingScreenContentSelectionItem = ({
  youtubeMetaData,
  handleSelectInitialTopic,
}) => {
  const youtubeTag = youtubeMetaData.youtubeTag;
  const youtubeId = youtubeMetaData.youtubeId;
  const isThisDue = youtubeMetaData.isThisDue;
  const isThisNew = youtubeMetaData?.isThisNew;
  const hasAllBeenReviewed = youtubeMetaData?.hasAllBeenReviewed;

  return (
    <div className='rounded-2xl border flex flex-col gap-1 p-2'>
      <div className='relative h-20 w-5/6 m-auto'>
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
          alt={youtubeId}
          className='m-auto pb-1 rounded object-contain'
          fill
        />
      </div>
      <Button
        variant={'link'}
        onClick={() => handleSelectInitialTopic(youtubeTag)}
        className={clsx(
          'pb-1 rounded w-full relative',
          isThisDue ? 'bg-amber-500' : '',
        )}
      >
        <span
          className='text-ellipsis'
          style={{
            overflow: 'hidden',
            maxWidth: '15ch',
          }}
        >
          {youtubeTag}
        </span>
        {isThisNew && (
          <span
            className='absolute top-0.5 right-2'
            style={{
              fontSize: 10,
            }}
          >
            🆕
          </span>
        )}
        {hasAllBeenReviewed && (
          <BookCheck
            className='absolute top-0.5 right-1 bg-green-200 rounded'
            style={{
              fontSize: 5,
            }}
          />
        )}
      </Button>
    </div>
  );
};

export default LandingScreenContentSelectionItem;
