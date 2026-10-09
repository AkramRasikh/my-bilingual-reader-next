import clsx from 'clsx';
import React from 'react';

interface SnippetReviewBreakdownDefinitionsProps {
  slicedSnippetSegment: Array<{ startIndex?: number; index?: number }>;
  vocab: Record<number, { meaning: string }>;
  getColorByIndex: (index?: number) => string;
  matchStartKey: number;
  matchEndKey: number;
  pinyinStart: number;
}

const SnippetReviewBreakdownDefinitions: React.FC<
  SnippetReviewBreakdownDefinitionsProps
> = ({
  slicedSnippetSegment,
  vocab,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
  togglableWordDataArrMemo,
  matchStartWordState,
}) => {
  const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];

  const matchingStartIndex = matchingWordData?.index;
  const matchingEndIndex =
    togglableWordDataArrMemo?.[matchStartWordState]?.endIndex;

  return (
    <div>
      {slicedSnippetSegment.map((item, index) => {
        const prev = slicedSnippetSegment[index - 1];
        const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
        let correspondingMeaning = vocab[item?.startIndex]?.meaning;
        // Return null if meaning is 'n/a' or startIndex is the same as previous
        if (
          correspondingMeaning === 'n/a' ||
          (index > 0 && item?.startIndex === prev?.startIndex)
        ) {
          return null;
        }
        const charIndex =
          typeof item.index === 'number' ? item.index : index + pinyinStart;
        const low = Math.min(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const high = Math.max(matchingStartIndex ?? 0, matchingEndIndex ?? 0);
        const animateText =
          matchingStartIndex !== undefined &&
          matchingEndIndex !== undefined &&
          charIndex >= low &&
          charIndex <= high;
        if (
          typeof correspondingMeaning === 'string' &&
          correspondingMeaning.length > 20
        ) {
          correspondingMeaning =
            correspondingMeaning.slice(0, animateText ? 40 : 20) + '…';
        }
        return (
          <span
            key={index}
            style={{
              color: getColorByIndex(item?.startIndex),
              opacity:
                charIndex < matchStartKey || charIndex > matchEndKey ? 0.25 : 1,
              fontStyle:
                charIndex < Math.max(0, matchStartKey - 5) ||
                charIndex > matchEndKey
                  ? 'italic'
                  : 'bold',
              fontSize: '10px',
              borderColor: animateText ? getColorByIndex(item?.startIndex) : '',
            }}
            className={clsx(
              animateText
                ? 'text-xl font-bold animate-pulse border-1 rounded'
                : '',
            )}
          >
            {addSpace && ' '}
            {correspondingMeaning}
          </span>
        );
      })}
    </div>
  );
};

export default SnippetReviewBreakdownDefinitions;
