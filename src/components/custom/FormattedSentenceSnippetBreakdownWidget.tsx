import React, { useState } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

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
        className='w-fit p-2 flex gap-3'
        data-testid='sentence-breakdown-hover-content'
      >
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
      </HoverCardContent>
    </HoverCard>
  );
};

export default FormattedSentenceSnippetBreakdownWidget;
