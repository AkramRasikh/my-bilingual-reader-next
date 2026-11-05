import React from 'react';
import { getTimeRangeProgress } from '@/app/LearningScreen/learning-screen-review-time-range';
import { arabic, chinese } from '@/app/languages';
import HoverWordCard from '@/components/custom/HoverWordCard';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import FormattedSentenceSnippetBreakdownWidget from './SnippetReviewContentBreakdownWidget';
import { getSnippetBoundaryFillStyle } from './SnippetReviewProgressWidget';
import LoadingSpinner from '../LoadingSpinner';
import {
  middleIndexOfSavingWordSpan,
  savingWordSpanCoversIndex,
  SavingWordSpan,
} from './savingWordSpans';

const BOUNDARY_REST = '#f6f7f8';

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
  snippetStartTime,
  snippetEndTime,
  isReadyForQuickReview,
  matchStartWordState,
  togglableWordDataArrMemo,
  savingWordSpans = [],
  matchWordsHighlghtedState
}: {
  savingWordSpans?: SavingWordSpan[];
  [key: string]: any;
}) => {
  const isArabic = languageSelectedState === arabic;
  const isChinese = languageSelectedState === chinese;

  const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex =
    togglableWordDataArrMemo?.[matchStartWordState + matchWordsHighlghtedState]?.endIndex;

  const inBoundary = (index: number) =>
    typeof matchStartKey === 'number' &&
    typeof matchEndKey === 'number' &&
    index >= matchStartKey &&
    index <= matchEndKey;

  const boundaryProgress = isReadyForQuickReview
    ? getTimeRangeProgress(
        currentTime ?? Number.NaN,
        snippetStartTime,
        snippetEndTime,
      )
    : null;
  const boundaryStyle =
    boundaryProgress == null
      ? { backgroundColor: BOUNDARY_REST }
      : getSnippetBoundaryFillStyle(
          boundaryProgress,
          isArabic ? 'rtl' : 'ltr',
        );

  const renderCharacter = (item, indexNested: number) => {
    const isUnderlined = item?.savedWords?.length > 0;
    const text = item?.text;
    const hasHighlightedBackground = inBoundary(indexNested);
    const hasStartIndex = item?.startIndex;
    const surfaceFormBreakdown = item?.surfaceForm;
    const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const animateText =
      matchingStartIndex !== undefined &&
      matchingEndIndex !== undefined &&
      indexNested >= low &&
      indexNested <= high;
    const charIsSaving = savingWordSpans.some((span) =>
      savingWordSpanCoversIndex(span, indexNested),
    );
    const savingSpinners = savingWordSpans.filter(
      (span) => indexNested === middleIndexOfSavingWordSpan(span),
    );
    const savingSpinner =
      savingSpinners.length > 0 ? (
        <div className='absolute inset-0 z-10 flex items-center justify-center pointer-events-none'>
          {savingSpinners.map((span, spinnerIndex) => (
            <div
              key={`${span.start}-${span.end}-${spinnerIndex}`}
              className='scale-75'
              data-testid='snippet-word-save-spinner'
            >
              <LoadingSpinner />
            </div>
          ))}
        </div>
      ) : null;

    if (isUnderlined) {
      return (
        <span
          key={indexNested}
          className={clsx(
            hasHighlightedBackground ? '' : 'opacity-35',
            'relative',
            animateText
              ? 'italic overline decoration-dashed decoration-2'
              : '',
            charIsSaving ? 'animate-pulse opacity-50' : '',
          )}
          style={{
            color: getColorByIndex(hasStartIndex),
            textDecorationColor: animateText
              ? getColorByIndex(hasStartIndex)
              : undefined,
          }}
        >
          {savingSpinner}
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
            charIsSaving ? 'animate-pulse opacity-50' : '',
            isLow && isArabic ? 'mr-0.5' : isLow ? 'ml-0.5' : '',
            isHigh && isArabic ? 'ml-0.5' : isHigh ? 'mr-0.5' : '',
          )}
        >
          {savingSpinner}
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
          hasHighlightedBackground ? '' : 'opacity-35',
          'relative',
          charIsSaving ? 'animate-pulse opacity-50' : '',
        )}
      >
        {savingSpinner}
        {text}
      </span>
    );
  };

  const characters = targetLangformatted ?? [];
  const before = [];
  const inside = [];
  const after = [];
  characters.forEach((item, index) => {
    const node = renderCharacter(item, index);
    if (!inBoundary(index)) {
      if (typeof matchStartKey === 'number' && index < matchStartKey) {
        before.push(node);
      } else {
        after.push(node);
      }
      return;
    }
    inside.push(node);
  });

  return (
    <span
      ref={ref}
      className={clsx(
        'inline-block max-w-full break-words',
        matchStartKey || matchEndKey ? 'm-0' : 'mt-auto mb-auto',
        isChinese ? 'text-center m-auto' : '',
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {before}
      {inside.length > 0 && (
        <span
          data-testid='snippet-boundary-fill'
          data-progress={boundaryProgress ?? undefined}
          className='rounded-sm'
          style={boundaryStyle}
        >
          {inside}
        </span>
      )}
      {after}
    </span>
  );
};

export default FormattedSentenceSnippet;
