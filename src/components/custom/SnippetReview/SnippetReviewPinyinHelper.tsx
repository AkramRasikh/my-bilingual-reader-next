import React from 'react';
import { LanguageEnum } from '@/app/languages';
import { pinyin } from 'pinyin-pro';
import arabicTransliterate from 'arabic-transliterate';
import FormattedSentenceSnippetProgressWidget from './SnippetReviewProgressWidget';
import clsx from 'clsx';

interface correspondingRomanized {
  text: string;
  startIndex?: number;
  index?: number;
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
  const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex =
    togglableWordDataArrMemo?.[matchStartWordState]?.endIndex;

  const isArabic = languageSelectedState === LanguageEnum.Arabic;
  return (
    <div>
      {slicedSnippetSegment.map((item, index) => {
        const prev = slicedSnippetSegment[index - 1];
        const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
        const charIndex =
          typeof item.index === 'number' ? item.index : index + pinyinStart;
        const hasHighlightedBackground =
          charIndex >= matchStartKey && charIndex <= matchEndKey;
        const played =
          hasHighlightedBackground && currentTime >= item?.secondForIndex;

        const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const animateText =
          matchingStartIndex !== undefined &&
          matchingEndIndex !== undefined &&
          charIndex >= low &&
          charIndex <= high;

        return (
          <span
            key={index}
            className={clsx(
              'relative',
              animateText ? 'font-bold animate-pulse border-b' : '',
            )}
            style={{
              color: getColorByIndex(item?.startIndex),
              opacity:
                charIndex < matchStartKey || charIndex > matchEndKey ? 0.25 : 1,
              fontStyle:
                charIndex < Math.max(0, matchStartKey - 5) ||
                charIndex > matchEndKey
                  ? 'italic'
                  : 'bold',
              borderColor: animateText ? getColorByIndex(item?.startIndex) : '',
            }}
          >
            {isArabic && isReadyForQuickReview && (
              <FormattedSentenceSnippetProgressWidget played={played} />
            )}
            {addSpace && ' '}
            {isArabic
              ? arabicTransliterate(item.text, 'arabic2latin', 'Arabic')
              : pinyin(item.text, { toneType: 'symbol' })}
          </span>
        );
      })}
    </div>
  );
};

export default SnippetReviewPinyinHelper;
