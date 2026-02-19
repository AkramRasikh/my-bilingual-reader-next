import { pinyin } from 'pinyin-pro';
import React from 'react';

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
}

const SnippetReviewPinyinHelper: React.FC<SnippetReviewPinyinHelperProps> = ({
  slicedSnippetSegment,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
}) => {
  return (
    // <div className='my-2 text-md px-1 rounded w-full'>
    <div>
      {slicedSnippetSegment.map((item, index) => {
        const prev = slicedSnippetSegment[index - 1];
        const addSpace = index > 0 && item?.startIndex !== prev?.startIndex;
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
            }}
          >
            {addSpace && ' '}
            {pinyin(item.text, { toneType: 'symbol' })}
          </span>
        );
      })}
    </div>
  );
};

export default SnippetReviewPinyinHelper;
