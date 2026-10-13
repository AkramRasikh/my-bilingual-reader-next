import React from 'react';
import { LanguageEnum } from '@/app/languages';
import { pinyin } from 'pinyin-pro';
import arabicTransliterate from 'arabic-transliterate';

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
  togglableWordDataArrMemo?: TogglableWord[];
  matchStartWordState?: number | null;
  matchWordsHighlghtedState?: number;
  className?: string;
}

const SnippetReviewPinyinHelper: React.FC<SnippetReviewPinyinHelperProps> = ({
  slicedSnippetSegment,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
  languageSelectedState,
  togglableWordDataArrMemo,
  matchStartWordState,
  matchWordsHighlghtedState = 0,
  className,
}) => {
  const matchingWordData =
    matchStartWordState == null
      ? undefined
      : togglableWordDataArrMemo?.[matchStartWordState];
  const matchingEndWord =
    matchStartWordState == null
      ? undefined
      : togglableWordDataArrMemo?.[matchStartWordState + matchWordsHighlghtedState];
  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex = matchingEndWord?.endIndex;

  const isArabic = languageSelectedState === LanguageEnum.Arabic;
  const syllables = slicedSnippetSegment.map((item, index) => {
    const prev = slicedSnippetSegment[index - 1];
    const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
    const charIndex =
      typeof item.index === 'number' ? item.index : index + pinyinStart;
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
          {current.addSpace && ' '}
          {current.syllable}
        </span>,
      );
      index += 1;
      continue;
    }

    const run = [current];
    let next = index + 1;
    while (next < syllables.length && syllables[next].animateText) {
      run.push(syllables[next]);
      next += 1;
    }
    const coversSeveralWords =
      new Set(run.map((part) => part.item?.startIndex)).size > 1;

    rows.push(
      <React.Fragment key={current.charIndex}>
        {current.addSpace && ' '}
        <span
          data-testid='snippet-review-pinyin-selected'
          className='relative inline-block animate-pulse rounded border leading-none'
          style={{
            borderColor: coversSeveralWords
              ? '#52525b'
              : getColorByIndex(current.item?.startIndex),
          }}
        >
          {run.map((part, partIndex) => (
            <span
              key={part.charIndex}
              style={{ color: getColorByIndex(part.item?.startIndex) }}
            >
              {partIndex > 0 && part.addSpace && ' '}
              {part.syllable}
            </span>
          ))}
        </span>
      </React.Fragment>,
    );
    index = next;
  }

  if (rows.length === 0) return null;

  return (
    <div
      className={className}
      data-testid={className ? 'snippet-overlay-line' : undefined}
    >
      {rows}
    </div>
  );
};

export default SnippetReviewPinyinHelper;
