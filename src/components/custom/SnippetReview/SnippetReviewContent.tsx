import React from 'react';
import FormattedSentenceSnippetProgressWidget from './SnippetReviewProgressWidget';
import { arabic, chinese } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import FormattedSentenceSnippetBreakdownWidget from './SnippetReviewContentBreakdownWidget';
import LoadingSpinner from '../LoadingSpinner';

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
  matchWordsHighlghtedState
}) => {
  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;

  const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex =
    togglableWordDataArrMemo?.[matchStartWordState + matchWordsHighlghtedState]?.endIndex;

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
        const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const animateText =
          matchingStartIndex !== undefined &&
          matchingEndIndex !== undefined &&
          indexNested >= low &&
          indexNested <= high;
        const animateTextIsLoading =
          wordIsLoadingGamePadState != null &&
          animateText &&
          wordIsLoadingGamePadState >= low &&
          wordIsLoadingGamePadState <= high;

        if (isUnderlined) {
          return (
            <span
              key={indexNested}
              className={clsx(
                hasHighlightedBackground ? 'bg-gray-200' : 'opacity-35',
                'relative',
                animateText
                  ? 'italic overline decoration-dashed decoration-2'
                  : '',
                animateTextIsLoading
                  ? 'italic overline decoration-dashed decoration-2 animate-pulse opacity-50'
                  : '',
              )}
              style={{
                color: getColorByIndex(hasStartIndex),
                textDecorationColor: animateText
                  ? getColorByIndex(hasStartIndex)
                  : undefined,
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
          const middleIndex = Math.floor((low + high) / 2);
          const showLoadingSpinner =
            animateTextIsLoading && indexNested === middleIndex;
          const isLow = indexNested === low;
          const isHigh = indexNested === high;


          return (
            <span
              key={indexNested}
              style={{
                textDecorationColor: animateText
                  ? getColorByIndex(hasStartIndex)
                  : undefined,
              }}
              className={clsx(
                'relative',
                animateText
                  ? 'italic overline decoration-dashed decoration-2'
                  : '',
                animateTextIsLoading
                  ? 'italic overline decoration-dashed decoration-2 animate-pulse opacity-50'
                  : '',
                isLow && isArabic ? 'mr-0.5' : isLow ? 'ml-0.5' : '',
                isHigh && isArabic ? 'ml-0.5' : isHigh ? 'mr-0.5' : '',
              )}
            >
              {showLoadingSpinner && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='scale-75'>
                    <LoadingSpinner />
                  </div>
                </div>
              )}
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
