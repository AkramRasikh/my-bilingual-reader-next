import React from 'react';
import { LanguageEnum } from '@/app/languages';
import { pinyin } from 'pinyin-pro';
import arabicTransliterate from 'arabic-transliterate';
import FormattedSentenceSnippetProgressWidget from './SnippetReviewProgressWidget';

interface correspondingRomanized {
  text: string;
  startIndex?: number;
  index?: number;
  secondForIndex?: number;
}

interface TogglableWord {
  index?: number;
  endIndex?: number;
}

interface SnippetReviewPinyinHelperProps {
  slicedSnippetSegment: correspondingRomanized[];
  getColorByIndex: (index?: number) => string;
  matchStartKey: number;
  matchEndKey: number;
  pinyinStart: number;
  languageSelectedState: LanguageEnum;
  isReadyForQuickReview?: boolean;
  currentTime?: number;
  togglableWordDataArrMemo?: TogglableWord[];
  matchStartWordState?: number | null;
}

const SnippetReviewPinyinHelper: React.FC<SnippetReviewPinyinHelperProps> = ({
  slicedSnippetSegment,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
  languageSelectedState,
  isReadyForQuickReview,
  currentTime,
  togglableWordDataArrMemo,
  matchStartWordState,
}) => {
  const matchingWordData =
    matchStartWordState == null
      ? undefined
      : togglableWordDataArrMemo?.[matchStartWordState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex = matchingWordData?.endIndex;

  const isArabic = languageSelectedState === LanguageEnum.Arabic;
  const syllables = slicedSnippetSegment.map((item, index) => {
    const prev = slicedSnippetSegment[index - 1];
    const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
    const charIndex =
      typeof item.index === 'number' ? item.index : index + pinyinStart;
    const hasHighlightedBackground =
      charIndex >= matchStartKey && charIndex <= matchEndKey;
    const played =
      hasHighlightedBackground &&
      currentTime !== undefined &&
      item.secondForIndex !== undefined &&
      currentTime >= item.secondForIndex;
    const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
    const animateText =
      matchingStartIndex !== undefined &&
      matchingEndIndex !== undefined &&
      charIndex >= low &&
      charIndex <= high;
    const syllable = isArabic
      ? arabicTransliterate(item.text, 'arabic2latin', 'Arabic')
      : pinyin(item.text, { toneType: 'symbol' });

    return {
      item,
      addSpace,
      charIndex,
      played,
      animateText,
      syllable,
    };
  });

  const rows: React.ReactNode[] = [];
  for (let index = 0; index < syllables.length; ) {
    const current = syllables[index];
    if (!current.animateText) {
      rows.push(
        <span
          key={current.charIndex}
          className='relative'
          style={{
            color: getColorByIndex(current.item?.startIndex),
            opacity:
              current.charIndex < matchStartKey || current.charIndex > matchEndKey
                ? 0.25
                : 1,
            fontStyle:
              current.charIndex < Math.max(0, matchStartKey - 5) ||
              current.charIndex > matchEndKey
                ? 'italic'
                : 'normal',
          }}
        >
          {isArabic && isReadyForQuickReview && (
            <FormattedSentenceSnippetProgressWidget played={current.played} />
          )}
          {current.addSpace && ' '}
          {current.syllable}
        </span>,
      );
      index += 1;
      continue;
    }

    const run = [current];
    let next = index + 1;
    while (
      next < syllables.length &&
      syllables[next].animateText &&
      syllables[next].item?.startIndex === current.item?.startIndex
    ) {
      run.push(syllables[next]);
      next += 1;
    }

    rows.push(
      <React.Fragment key={current.charIndex}>
        {current.addSpace && ' '}
        <span
          data-testid='snippet-review-pinyin-selected'
          className='relative inline-block animate-pulse rounded border leading-none'
          style={{
            color: getColorByIndex(current.item?.startIndex),
            borderColor: getColorByIndex(current.item?.startIndex),
          }}
        >
          {run.map((part, partIndex) => (
            <React.Fragment key={part.charIndex}>
              {isArabic && isReadyForQuickReview && (
                <FormattedSentenceSnippetProgressWidget played={part.played} />
              )}
              {partIndex > 0 && part.addSpace && ' '}
              {part.syllable}
            </React.Fragment>
          ))}
        </span>
      </React.Fragment>,
    );
    index = next;
  }

  return <div>{rows}</div>;
};

export default SnippetReviewPinyinHelper;
