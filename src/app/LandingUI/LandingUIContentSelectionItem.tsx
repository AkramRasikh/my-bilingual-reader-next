import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Check, Clapperboard, ExternalLink } from 'lucide-react';
import { ContentStateTypes } from '../reducers/content-reducer';
import { LandingUIComprehensiveType } from './Provider/LandingUIProvider';
import { LanguageEnum } from '../languages';
import { getFallbackThumbnailGradient } from './content-thumbnail';

interface LandingUIContentSelectionItemProps extends LandingUIComprehensiveType {
  flagEmoji?: string;
  language?: LanguageEnum;
}

const LandingUIContentSelectionItemImage = ({
  title,
  origin,
  thumbnailUrl,
}: Pick<LandingUIComprehensiveType, 'title' | 'origin' | 'thumbnailUrl'>) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = thumbnailUrl && failedUrl !== thumbnailUrl;

  return (
    <div className='relative h-30 w-8/10 m-auto'>
      {showImage ? (
        <Image
          src={thumbnailUrl}
          alt={title}
          className='m-auto pb-1 rounded-lg'
          fill
          onError={() => setFailedUrl(thumbnailUrl)}
        />
      ) : (
        <div
          data-testid={`content-thumbnail-fallback-${title}`}
          className={clsx(
            'absolute inset-0 mb-1 flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg bg-gradient-to-br px-3 text-center text-white',
            getFallbackThumbnailGradient(title),
          )}
        >
          <Clapperboard className='h-6 w-6 opacity-90' aria-hidden />
          <span className='line-clamp-2 text-xs font-semibold drop-shadow-sm'>
            {title}
          </span>
          <span className='text-[10px] uppercase tracking-wide opacity-80'>
            {origin}
          </span>
        </div>
      )}
    </div>
  );
};

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
  origin,
  thumbnailUrl,
  netflixWatchUrl,
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
      <LandingUIContentSelectionItemImage
        title={title}
        origin={origin}
        thumbnailUrl={thumbnailUrl}
      />
      <div className='flex items-center gap-1'>
        <Button
          variant={'link'}
          onClick={() => handleSelectInitialTopic(title)}
          className={clsx(
            'pb-1 rounded min-w-0 flex-1 relative',
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
        {netflixWatchUrl && (
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='shrink-0'
          >
            <a
              href={netflixWatchUrl}
              target='_blank'
              rel='noopener noreferrer'
              title='Open on Netflix'
              aria-label={`Open ${title} on Netflix`}
              data-testid={`netflix-link-${title}`}
            >
              <ExternalLink />
            </a>
          </Button>
        )}
      </div>
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
