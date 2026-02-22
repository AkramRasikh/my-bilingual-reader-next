import React from 'react';
import { LanguageEnum } from '@/app/languages';
import { pinyin } from 'pinyin-pro';
import arabicTransliterate from 'arabic-transliterate';
import FormattedSentenceSnippetProgressWidget from './SnippetReviewProgressWidget';

interface correspondingRomanized {
  text: string;
  startIndex?: number;
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
}) => {
  const isArabic = languageSelectedState === LanguageEnum.Arabic;
  return (
    <div>
      {slicedSnippetSegment.map((item, index) => {
        const prev = slicedSnippetSegment[index - 1];
        const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
        const hasHighlightedBackground =
          index >= matchStartKey && index <= matchEndKey;
        const played =
          hasHighlightedBackground && currentTime >= item?.secondForIndex;
        return (
          <span
            key={index}
            className='relative'
            style={{
              color: getColorByIndex(item?.startIndex),
              opacity:
                index < matchStartKey - pinyinStart || index > matchEndKey
                  ? 0.25
                  : 1,
              fontStyle:
                index < Math.max(0, matchStartKey - 5) || index > matchEndKey
                  ? 'italic'
                  : 'bold',
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
