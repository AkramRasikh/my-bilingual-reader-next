import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import HoverWordCardActive from './HoverWordCardActive';

const HoverWordCard = ({
  text,
  wordPopUpState,
  setWordPopUpState,
  wordsForSelectedTopic,
  handleDeleteWordDataProvider,
  wordsFromSentence,
  hasHighlightedBackground,
  originalText,
}) => {
  const [isOriginalWordSettingState, setIsOriginalWordSettingState] =
    useState(false);

  useEffect(() => {
    const textIsOriginalToSelectedTopic = wordsForSelectedTopic?.some(
      (item) => text === item.baseForm || text === item.surfaceForm,
    );

    if (textIsOriginalToSelectedTopic) {
      setIsOriginalWordSettingState(true);
    }
  }, [wordsForSelectedTopic]);

  const onHoverTrigger = () => {
    const hoverTings = wordsFromSentence?.filter((item) => {
      const baseForm = item.baseForm;
      const surfaceForm = item.surfaceForm;
      if (originalText) {
        return (
          originalText.includes(baseForm) || originalText.includes(surfaceForm)
        );
      }
      if (text.includes(baseForm) || text.includes(surfaceForm)) {
        return true;
      }
    });

    setWordPopUpState(hoverTings);
  };

  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        className={clsx(
          'p-0',
          hasHighlightedBackground
            ? 'bg-yellow-200'
            : isOriginalWordSettingState
            ? 'bg-blue-50 rounded'
            : '',
        )}
        style={{
          textDecorationLine: 'underline',
        }}
        onMouseEnter={onHoverTrigger}
      >
        <span>{text}</span>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        <div className='flex justify-between gap-4'>
          <div className='space-y-1'>
            {wordPopUpState?.map((word, index) => (
              <HoverWordCardActive
                key={index}
                word={word}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              />
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HoverWordCard;
