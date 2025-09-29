import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Check } from 'lucide-react';

const LandingScreenContentSelectionItemImage = ({ youtubeId }) => (
  <div className='relative h-20 w-5/6 m-auto'>
    <Image
      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
      alt={youtubeId}
      className='m-auto pb-1 rounded object-contain'
      fill
    />
  </div>
);

const LandingScreenContentSelectionItemTags = ({
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
  const youtubeTag = youtubeMetaData.youtubeTag;
  const youtubeId = youtubeMetaData.youtubeId;
  const isThisDue = youtubeMetaData.isThisDue;
  const isThisNew = youtubeMetaData?.isThisNew;
  const hasAllBeenReviewed = youtubeMetaData?.hasAllBeenReviewed;

  return (
    <div className='rounded-2xl border flex flex-col gap-1 p-2 relative'>
      <LandingScreenContentSelectionItemImage youtubeId={youtubeId} />
      <Button
        variant={'link'}
        onClick={() => handleSelectInitialTopic(youtubeTag)}
        className={clsx(
          'pb-1 rounded w-full relative',
          isThisDue ? 'bg-amber-300' : '',
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
      </Button>
      <LandingScreenContentSelectionItemTags
        hasAllBeenReviewed={hasAllBeenReviewed}
        isThisNew={isThisNew}
      />
    </div>
  );
};

export default LandingScreenContentSelectionItem;
