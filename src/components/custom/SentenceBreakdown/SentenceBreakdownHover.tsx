import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { Button } from '@/components/ui/button';
import { pinyin } from 'pinyin-pro';
import { chinese } from '@/app/languages';

const SentenceBreakdownHover = ({
  handleSaveFunc,
  surfaceForm,
  meaning,
  color,
  wordIsSaved,
  isSnippetReview,
  languageSelectedState,
}) => {
  const placeholder = meaning === 'n/a';
  const showPinyin = isSnippetReview && languageSelectedState === chinese;
  const pinyinText = showPinyin
    ? pinyin(surfaceForm, { toneType: 'symbol' })
    : '';
  if (placeholder) {
    return (
      <span
        style={{
          color: 'black',
        }}
      >
        {surfaceForm}
      </span>
    );
  }
  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        style={{
          textDecorationLine: wordIsSaved ? 'underline' : '',
        }}
      >
        <span
          className={
            showPinyin ? 'inline-flex flex-col items-center' : undefined
          }
          style={{
            color,
          }}
        >
          <span>{surfaceForm}</span>
          {showPinyin && <span className='text-[12px]'>{pinyinText}</span>}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className='w-fit p-2 flex gap-3'
        data-testid='sentence-breakdown-hover-content'
      >
        <Button
          data-testid='breakdown-save-word-deepseek-button'
          variant='secondary'
          size='icon'
          onClick={() => handleSaveFunc(false, surfaceForm, meaning)}
        >
          <img src='/deepseek.png' alt='Deepseek logo' />
        </Button>

        <Button
          data-testid='breakdown-save-word-google-button'
          variant='secondary'
          size='icon'
          onClick={() => handleSaveFunc(true, surfaceForm, meaning)}
        >
          <img src='/google.png' alt='Google logo' />
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SentenceBreakdownHover;
