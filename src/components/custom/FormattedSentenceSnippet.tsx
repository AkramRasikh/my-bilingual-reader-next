import { arabic } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';

const FormattedSentenceSnippet = ({
  ref,
  targetLangformatted,
  handleMouseLeave,
  handleMouseEnter,
  wordPopUpState,
  setWordPopUpState,
  wordsForSelectedTopic,
  handleDeleteWordDataProvider,
  wordsFromSentence,
  languageSelectedState,
  matchStartKey,
  matchEndKey,
}) => {
  const isArabic = languageSelectedState === arabic;

  return (
    <span
      ref={ref}
      className={clsx(matchStartKey || matchEndKey ? 'm-0' : 'mt-auto mb-auto')}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {targetLangformatted?.map((item, indexNested) => {
        const isUnderlined = item?.savedWords?.length > 0;
        const text = item?.text;
        const hasHighlightedBackground =
          indexNested >= matchStartKey && indexNested <= matchEndKey;
        const hasStartIndex = item?.startIndex;
        if (isUnderlined) {
          return (
            <span
              key={indexNested}
              className={clsx(
                hasHighlightedBackground
                  ? 'bg-gray-200 border shadow-md'
                  : ' opacity-35',
              )}
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
              />
            </span>
          );
        }

        return (
          <span
            key={indexNested}
            data-testid={`formatted-chunk-${indexNested}`}
            onMouseEnter={
              isUnderlined ? () => handleMouseEnter?.(text) : () => {}
            }
            onMouseLeave={handleMouseLeave}
            style={{
              textDecorationLine: isUnderlined ? 'underline' : 'none',
              color: getColorByIndex(hasStartIndex),
            }}
            className={clsx(
              hasHighlightedBackground
                ? 'bg-gray-200 border shadow-md'
                : 'opacity-35',
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
