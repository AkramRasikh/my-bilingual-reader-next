import { arabic } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import clsx from 'clsx';

const FormattedSentence = ({
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
    <span ref={ref} className='mt-auto mb-auto' dir={isArabic ? 'rtl' : 'ltr'}>
      {targetLangformatted?.map((item, indexNested) => {
        const isUnderlined = item?.style?.textDecorationLine;
        const text = item?.text;
        const hasHighlightedBackground =
          indexNested >= matchStartKey && indexNested <= matchEndKey;

        if (isUnderlined) {
          return (
            <HoverWordCard
              key={indexNested}
              text={text}
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              wordsFromSentence={wordsFromSentence}
              hasHighlightedBackground={hasHighlightedBackground}
              originalText={item?.originalText}
            />
          );
        }

        // bg-yellow-200 shadow-yellow-500 shadow-sm px-1 rounded ${opacityClass}
        return (
          <span
            key={indexNested}
            onMouseEnter={
              isUnderlined ? () => handleMouseEnter?.(text) : () => {}
            }
            onMouseLeave={handleMouseLeave}
            style={{
              textDecorationLine: isUnderlined ? 'underline' : 'none',
            }}
            className={clsx(hasHighlightedBackground ? 'bg-yellow-200 ' : '')}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
};

export default FormattedSentence;
