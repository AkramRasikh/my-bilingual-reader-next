import React from 'react';

interface SnippetReviewBreakdownDefinitionsProps {
  slicedSnippetSegment: Array<{ startIndex?: number }>;
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
}) => {
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
        if (
          typeof correspondingMeaning === 'string' &&
          correspondingMeaning.length > 20
        ) {
          correspondingMeaning = correspondingMeaning.slice(0, 20) + '…';
        }
        return (
          <span
            key={index}
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
              fontSize: '10px',
            }}
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
