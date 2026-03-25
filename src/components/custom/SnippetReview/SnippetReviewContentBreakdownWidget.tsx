import React, { useState } from 'react';
import clsx from 'clsx';
import { Button } from '../../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../ui/hover-card';
import { arabic, chinese, LanguageEnum } from '@/app/languages';
import { pinyin } from 'pinyin-pro';
import arabicTransliterate from 'arabic-transliterate';

interface FormattedSentenceSnippetBreakdownWidgetProps {
  text: string;
  color: string;
  hasHighlightedBackground: boolean;
  surfaceFormBreakdown: any;
  meaning: any;
  handleSaveFunc: (
    isGoogle: boolean,
    surfaceFormBreakdown: any,
    meaning: any,
  ) => Promise<void>;
  indexNum: number;
  languageSelectedState: LanguageEnum;
}

const FormattedSentenceSnippetBreakdownWidget: React.FC<
  FormattedSentenceSnippetBreakdownWidgetProps
> = ({
  text,
  color,
  hasHighlightedBackground,
  surfaceFormBreakdown,
  meaning,
  handleSaveFunc,
  indexNum,
  languageSelectedState,
}) => {
  const [loading, setLoading] = useState(false);

  const textOpacity = loading ? 'opacity-50' : '';

  // Extracted save handler
  const handleSave = async (isGoogle: boolean) => {
    setLoading(true);
    try {
      await handleSaveFunc(isGoogle, surfaceFormBreakdown, meaning);
    } finally {
      setLoading(false);
    }
  };

  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;
  const transliteratedText =
    surfaceFormBreakdown && isArabic
      ? arabicTransliterate(surfaceFormBreakdown, 'arabic2latin', 'Arabic')
      : surfaceFormBreakdown && isChinese
        ? pinyin(surfaceFormBreakdown, { toneType: 'symbol' })
        : '';

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          data-testid={`formatted-chunk-${indexNum}`}
          style={{ color }}
          className={clsx(
            hasHighlightedBackground ? 'bg-gray-200' : 'opacity-35',
            textOpacity,
          )}
        >
          {text}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className='w-fit p-2 flex gap-3 flex-col'
        data-testid='sentence-breakdown-hover-content'
      >
        <div className='flex gap-1 mx-auto'>
          <Button
            data-testid='breakdown-save-word-deepseek-button'
            variant='secondary'
            size='icon'
            disabled={loading}
            onClick={() => handleSave(false)}
          >
            <img src='/deepseek.png' alt='Deepseek logo' />
          </Button>
          <Button
            data-testid='breakdown-save-word-google-button'
            variant='secondary'
            size='icon'
            disabled={loading}
            onClick={() => handleSave(true)}
          >
            <img src='/google.png' alt='Google logo' />
          </Button>
        </div>
        <span className='text-center text-sm font-medium'>{meaning}</span>
        {transliteratedText && (
          <span className='text-center text-sm font-medium'>
            {transliteratedText}
          </span>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default FormattedSentenceSnippetBreakdownWidget;
