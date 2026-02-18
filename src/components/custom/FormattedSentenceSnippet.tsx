import React, { useState } from 'react';
import { arabic, chinese } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

// New component for the breakdown widget with loading state and opacity
const FormattedSentenceBreakdownWidget = ({
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
  const handleSave = async (isGoogle) => {
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

const FormattedSentenceSnippet = ({
  ref,
  targetLangformatted,
  wordPopUpState,
  setWordPopUpState,
  wordsForSelectedTopic,
  handleDeleteWordDataProvider,
  wordsFromSentence,
  languageSelectedState,
  matchStartKey,
  matchEndKey,
  handleSaveFunc,
  currentTime,
}) => {
  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;
  const flooredTime = Math.floor(currentTime);

  return (
    <span
      ref={ref}
      className={clsx(
        matchStartKey || matchEndKey ? 'm-0' : 'mt-auto mb-auto',
        isChinese ? 'text-center m-auto' : '',
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {targetLangformatted?.map((item, indexNested) => {
        const isUnderlined = item?.savedWords?.length > 0;
        const text = item?.text;
        const hasHighlightedBackground =
          indexNested >= matchStartKey && indexNested <= matchEndKey;
        const hasStartIndex = item?.startIndex;
        const surfaceFormBreakdown = item?.surfaceForm;
        const played =
          hasHighlightedBackground && flooredTime >= item?.secondForIndex;

        if (isUnderlined) {
          return (
            <span
              key={indexNested}
              className={clsx(
                hasHighlightedBackground ? 'bg-gray-200' : 'opacity-35',
                played ? 'font-extrabold' : '',
              )}
              style={{
                color: getColorByIndex(hasStartIndex),
              }}
            >
              <HoverWordCard
                text={text}
                wordPopUpState={wordPopUpState}
                setWordPopUpState={setWordPopUpState}
                wordsForSelectedTopic={wordsForSelectedTopic}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                wordsFromSentence={wordsFromSentence}
                hasHighlightedBackground={hasHighlightedBackground}
                originalText={item?.originalText}
                savedWords={item?.savedWords}
                disableHighlightBackground
              />
            </span>
          );
        }

        if (!(item?.meaning === 'n/a' && surfaceFormBreakdown)) {
          return (
            <span
              key={indexNested}
              className={clsx(played ? 'font-extrabold' : '')}
            >
              <FormattedSentenceBreakdownWidget
                text={text}
                indexNum={indexNested}
                color={getColorByIndex(hasStartIndex)}
                hasHighlightedBackground={hasHighlightedBackground}
                surfaceFormBreakdown={surfaceFormBreakdown}
                meaning={item?.meaning}
                handleSaveFunc={handleSaveFunc}
              />
            </span>
          );
        }

        return (
          <span
            key={indexNested}
            data-testid={`formatted-chunk-${indexNested}`}
            style={{
              textDecorationLine: isUnderlined ? 'underline' : 'none',
              color: getColorByIndex(hasStartIndex),
            }}
            className={clsx(
              hasHighlightedBackground ? 'bg-gray-200 border' : 'opacity-35',
              played ? 'font-extrabold' : '',
            )}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
};

export default FormattedSentenceSnippet;
