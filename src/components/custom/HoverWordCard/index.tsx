import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useMemo } from 'react';
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
  savedWords,
}) => {
  const isOriginalWordSettingState = useMemo(() => {
    return (
      wordsForSelectedTopic?.some(
        (item) => text === item.baseForm || text === item.surfaceForm,
      ) || false
    );
  }, [wordsForSelectedTopic, text]);

  const onHoverTrigger = () => {
    const hoverTings = wordsFromSentence?.filter((item) =>
      savedWords?.includes(item.id),
    );
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
        data-testid={`underlined-word-${text}`}
      >
        <span>{text}</span>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        <div
          className='flex justify-between gap-4'
          data-testid='word-pop-up-container'
        >
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
