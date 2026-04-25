import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check,
} from 'lucide-react';
import { ContentStateTypes } from '../reducers/content-reducer';
import { LandingUIComprehensiveType } from './Provider/LandingUIProvider';
import { LanguageEnum } from '../languages';

interface LandingUIContentSelectionItemProps extends LandingUIComprehensiveType {
  flagEmoji?: string;
  language?: LanguageEnum;
}

const LandingUIContentSelectionItemImage = ({
  youtubeId,
}: {
  youtubeId: LandingUIComprehensiveType['youtubeId'];
}) => (
  <div className='relative h-30 w-8/10 m-auto'>
    <Image
      src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
      alt={youtubeId || 'youtubeId'}
      className='m-auto pb-1 rounded-lg'
      fill
    />
  </div>
);

const LandingUIContentSelectionItemTags = ({
  contentHasBeenReviews,
}: {
  contentHasBeenReviews: LandingUIComprehensiveType['contentHasBeenReviews'];
}) => {
  return !contentHasBeenReviews ? (
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
  dueSentences,
  totalSentencesWithReview,
  contentHasBeenReviews,
  dueWords,
  totalWordsWithReview,
  dueSnippets,
  flagEmoji,
  language,
}: LandingUIContentSelectionItemProps) => {
  const router = useRouter();

  const handleSelectInitialTopic = (topicName: ContentStateTypes['title']) => {
    const searchParams = new URLSearchParams({
      topic: topicName,
    });

    if (language) {
      searchParams.set('language', language);
    }

    router.push(`/content?${searchParams.toString()}`);
  };

  return (
    <div className='flex flex-col gap-1 p-2 relative'>
      {language && flagEmoji && (
        <span className='absolute top-0.5 left-2.5 text-lg' title='language-flag'>
          {flagEmoji}
        </span>
      )}
      <LandingUIContentSelectionItemImage youtubeId={youtubeId} />
      <Button
        variant={'link'}
        onClick={() => handleSelectInitialTopic(title)}
        className={clsx(
          'pb-1 rounded w-full relative',
          dueSentences > 0 ? 'bg-amber-300' : '',
        )}
        title={title}
        data-testid={`content-item-${title}`}
      >
        <span
          className='text-ellipsis'
          style={{
            overflow: 'hidden',
            maxWidth: '20ch',
          }}
        >
          {title}
        </span>
      </Button>
      <LandingUIContentSelectionItemTags
        contentHasBeenReviews={contentHasBeenReviews}
      />

      <div className='text-xs text-muted-foreground px-1 pb-1 flex items-center justify-between gap-2'>
        <p data-testid={`due-sentences-${title}`}>
          Sentences: {dueSentences}/{totalSentencesWithReview}
        </p>
        <p data-testid={`due-words-${title}`}>
          Words: {dueWords}/{totalWordsWithReview}
        </p>
        <p data-testid={`due-snippets-${title}`}>Snippets: {dueSnippets}</p>
      </div>
    </div>
  );
};

export default LandingUIContentSelectionItem;
