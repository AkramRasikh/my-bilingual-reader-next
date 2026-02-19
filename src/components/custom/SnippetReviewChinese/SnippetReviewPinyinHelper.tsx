import { pinyin } from 'pinyin-pro';
import React from 'react';

interface PinyinItem {
  text: string;
  startIndex?: number;
}

interface SnippetReviewPinyinHelperProps {
  pinyinTing: PinyinItem[];
  getColorByIndex: (index?: number) => string;
  matchStartKey: number;
  matchEndKey: number;
  pinyinStart: number;
}

const SnippetReviewPinyinHelper: React.FC<SnippetReviewPinyinHelperProps> = ({
  pinyinTing,
  getColorByIndex,
  matchStartKey,
  matchEndKey,
  pinyinStart,
  vocab,
}) => {
  return (
    <div className='my-2 text-md px-1 rounded w-full'>
      <div>
        {pinyinTing.map((item, index) => {
          const prev = pinyinTing[index - 1];
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
      <div>
        {pinyinTing.map((item, index) => {
          const prev = pinyinTing[index - 1];
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
    </div>
  );
};

export default SnippetReviewPinyinHelper;
