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
}) => {
  return (
    <div className='my-2 text-md w-fit px-1 rounded'>
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
                  index < matchStartKey - pinyinStart ||
                  index > matchEndKey
                    ? 0.25
                    : 1,
                fontStyle:
                  index < Math.max(0, matchStartKey - 5) ||
                  index > matchEndKey
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
    </div>
  );
};

export default SnippetReviewPinyinHelper;