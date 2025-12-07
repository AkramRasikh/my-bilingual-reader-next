import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Check, WholeWordIcon } from 'lucide-react';

const LandingUIContentSelectionItemImage = ({ youtubeId }) => (
  <div className='relative h-20 w-5/6 m-auto'>
    <Image
      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
      alt={youtubeId || 'youtubeId'}
      className='m-auto pb-1 rounded object-contain'
      fill
    />
  </div>
);

const LandingUIContentSelectionItemTags = ({
  hasAllBeenReviewed,
  isThisNew,
}) => {
  return hasAllBeenReviewed ? (
    <Check
      className='absolute top-2 right-3 bg-green-400 rounded p-0.5 border h-4 w-4'
      style={{
        fontSize: 5,
      }}
    />
  ) : isThisNew ? (
    <span
      className='absolute top-2 right-3'
      style={{
        fontSize: 10,
      }}
    >
      🆕
    </span>
  ) : null;
};

const LandingScreenContentSelectionItem = ({
  youtubeMetaData,
  handleSelectInitialTopic,
}) => {
  const title = youtubeMetaData.title;
  const youtubeId = youtubeMetaData.youtubeId;
  const isThisDue = youtubeMetaData.isThisDue;
  const isThisNew = youtubeMetaData?.isThisNew;
  const hasAllBeenReviewed = youtubeMetaData?.hasAllBeenReviewed;
  const numberOfDueWords = youtubeMetaData?.numberOfDueWords;

  return (
    <div className='rounded-2xl border flex flex-col gap-1 p-2 relative'>
      <LandingUIContentSelectionItemImage youtubeId={youtubeId} />
      <Button
        variant={'link'}
        onClick={() => handleSelectInitialTopic(title)}
        className={clsx(
          'pb-1 rounded w-full relative',
          isThisDue > 0 ? 'bg-amber-300' : '',
        )}
      >
        <span
          className='text-ellipsis'
          style={{
            overflow: 'hidden',
            maxWidth: '15ch',
          }}
        >
          {title}
        </span>
      </Button>
      <LandingUIContentSelectionItemTags
        hasAllBeenReviewed={hasAllBeenReviewed}
        isThisNew={isThisNew}
      />

      {isThisDue > 0 && (
        <div className='absolute flex flex-row gap-0.5 m-auto bg-amber-200 rounded-xl p-1 -bottom-3 left-0 z-10'>
          <WholeWordIcon className='h-3 w-3 m-auto' />
          <span className='text-xs font-light'>{isThisDue}</span>{' '}
        </div>
      )}
      {numberOfDueWords > 0 && (
        <div className='absolute flex flex-row gap-0.5 m-auto bg-amber-100 rounded-xl p-1 -bottom-3 right-0 z-10'>
          <WholeWordIcon className='h-3 w-3 m-auto' />
          <span className='text-xs font-light'>{numberOfDueWords}</span>{' '}
        </div>
      )}
    </div>
  );
};

export default LandingScreenContentSelectionItem;
