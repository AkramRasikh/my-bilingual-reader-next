import React from 'react';
import FormattedSentenceSnippetProgressWidget from './FormattedSentenceSnippetProgressWidget';
import { arabic, chinese } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import FormattedSentenceSnippetBreakdownWidget from './FormattedSentenceSnippetBreakdownWidget';

const FormattedSentenceSnippet = ({
  ref,
  targetLangformatted,
  wordPopUpState,
  setWordPopUpState,
  handleDeleteWordDataProvider,
  wordsFromSentence,
  languageSelectedState,
  matchStartKey,
  matchEndKey,
  handleSaveFunc,
  currentTime,
  isReadyForQuickReview,
}) => {
  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;

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
          hasHighlightedBackground && currentTime >= item?.secondForIndex;

        if (isUnderlined) {
          return (
            <span
              key={indexNested}
              className={clsx(
                hasHighlightedBackground ? 'bg-gray-200' : 'opacity-35',
                played ? 'font-extrabold' : '',
                'relative',
              )}
              style={{
                color: getColorByIndex(hasStartIndex),
              }}
            >
              {isReadyForQuickReview && (
                <FormattedSentenceSnippetProgressWidget played={played} />
              )}
              <HoverWordCard
                text={text}
                wordPopUpState={wordPopUpState}
                setWordPopUpState={setWordPopUpState}
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
              className={clsx(played ? 'font-extrabold' : '', 'relative')}
            >
              {isReadyForQuickReview && (
                <FormattedSentenceSnippetProgressWidget played={played} />
              )}
              <FormattedSentenceSnippetBreakdownWidget
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
              hasHighlightedBackground ? 'bg-gray-200' : 'opacity-35',
              played ? 'font-extrabold' : '',
              'relative',
            )}
          >
            {isReadyForQuickReview && (
              <FormattedSentenceSnippetProgressWidget played={played} />
            )}
            {text}
          </span>
        );
      })}
    </span>
  );
};

export default FormattedSentenceSnippet;
