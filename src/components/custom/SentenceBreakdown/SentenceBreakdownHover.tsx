import React, { useState } from 'react';
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
  handleBreakdownSentence,
  sentenceId,
}) => {
  const [loading, setLoading] = useState(false);
  const placeholder = meaning === 'n/a';
  const showPinyin = isSnippetReview && languageSelectedState === chinese;
  const pinyinText = showPinyin
    ? pinyin(surfaceForm, { toneType: 'symbol' })
    : '';

  const handleDoubleClick = async () => {
    if (!handleBreakdownSentence) return;
    setLoading(true);
    try {
      await handleBreakdownSentence({ sentenceId, targetLang: surfaceForm });
    } finally {
      setLoading(false);
    }
  };

  if (placeholder) {
    return (
      <span
        className={`text-black relative select-text ${handleBreakdownSentence ? 'cursor-pointer' : ''} ${loading ? 'opacity-50' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        {surfaceForm}
        {loading && (
          <span
            className='absolute right-[-20px] top-1/2 -translate-y-1/2'
            aria-label='Loading'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='animate-spin'
            >
              <circle
                cx='8'
                cy='8'
                r='7'
                stroke='#888'
                strokeWidth='2'
                strokeDasharray='10 10'
                strokeLinecap='round'
              />
            </svg>
          </span>
        )}
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
