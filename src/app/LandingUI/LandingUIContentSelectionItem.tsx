import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check,
  ScissorsIcon,
  ScrollTextIcon,
  WholeWordIcon,
} from 'lucide-react';
import { ContentStateTypes } from '../reducers/content-reducer';
import { LandingUIComprehensiveType } from './Provider/LandingUIProvider';

const LandingUIContentSelectionItemImage = ({
  youtubeId,
}: {
  youtubeId: LandingUIComprehensiveType['youtubeId'];
}) => (
  <div className='relative h-30 w-9/10 m-auto'>
    <Image
      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
      alt={youtubeId || 'youtubeId'}
      className='m-auto pb-1 rounded object-contain'
      fill
    />
  </div>
);

const LandingUIContentSelectionItemTags = ({
  isThisNew,
}: {
  isThisNew: LandingUIComprehensiveType['isThisNew'];
}) => {
  return isThisNew ? (
    <span
      className='absolute top-2 right-3'
      style={{
        fontSize: 10,
      }}
    >
      🆕
    </span>
  ) : (
    <Check
      className='absolute top-2 right-3 bg-green-400 rounded p-0.5 border h-4 w-4'
      style={{
        fontSize: 5,
      }}
    />
  );
};

const LandingUIContentSelectionItem = ({
  title,
  youtubeId,
  isThisDue,
  isThisNew,
  numberOfDueWords,
  snippetsDue,
}: LandingUIComprehensiveType) => {
  const router = useRouter();

  const handleSelectInitialTopic = (topicName: ContentStateTypes['title']) => {
    router.push(`/content?topic=${topicName}`);
  };

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
      <LandingUIContentSelectionItemTags isThisNew={isThisNew} />

      {snippetsDue > 0 && (
        <div className='absolute flex flex-row gap-0.5 m-auto bg-amber-200 rounded-xl p-1 top-1 left-0 z-10'>
          <ScissorsIcon className='h-3 w-3 m-auto' />
          <span className='text-xs font-light'>{snippetsDue}</span>
        </div>
      )}
      {isThisDue > 0 && (
        <div className='absolute flex flex-row gap-0.5 m-auto bg-amber-200 rounded-xl p-1 -bottom-3 left-0 z-10'>
          <ScrollTextIcon className='h-3 w-3 m-auto' />
          <span className='text-xs font-light'>{isThisDue}</span>
        </div>
      )}
      {numberOfDueWords > 0 && (
        <div className='absolute flex flex-row gap-0.5 m-auto bg-amber-100 rounded-xl p-1 -bottom-3 right-0 z-10'>
          <WholeWordIcon className='h-3 w-3 m-auto' />
          <span className='text-xs font-light'>{numberOfDueWords}</span>
        </div>
      )}
    </div>
  );
};

export default LandingUIContentSelectionItem;
