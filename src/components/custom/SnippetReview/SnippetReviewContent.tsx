import React from 'react';
import FormattedSentenceSnippetProgressWidget from './SnippetReviewProgressWidget';
import { arabic, chinese } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import FormattedSentenceSnippetBreakdownWidget from './SnippetReviewContentBreakdownWidget';

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
  matchStartWordState,
  togglableWordDataArrMemo,
  wordIsLoadingGamePadState,
}) => {
  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;

  const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex =
    togglableWordDataArrMemo?.[matchStartWordState]?.endIndex;

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
          // console.log('## is broken down but not saved', text);
          const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
          const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
          const animateText =
            matchingStartIndex !== undefined &&
            matchingEndIndex !== undefined &&
            indexNested >= low &&
            indexNested <= high;
          const animateTextIsLoading =
            animateText &&
            wordIsLoadingGamePadState >= low &&
            wordIsLoadingGamePadState <= high;

          return (
            <span
              key={indexNested}
              className={clsx(
                'relative',
                animateTextIsLoading
                  ? 'text-xl font-bold animate-ping opacity-50 italic'
                  : animateText
                    ? 'text-xl font-bold animate-pulse'
                    : '',
                indexNested === low
                  ? 'ml-0.5'
                  : indexNested === high
                    ? 'mr-0.5'
                    : '',
              )}
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
                languageSelectedState={languageSelectedState}
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
