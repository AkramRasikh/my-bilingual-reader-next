import clsx from 'clsx';
import { useState } from 'react';
import Xarrow from 'react-xarrows';
import BreakSentenceHoverCard from './BreakSentenceHoverCard';
import getColorByIndex from '@/utils/get-color-by-index';

export const NewSentenceBreakdown = ({
  vocab,
  thisSentencesSavedWords,
  handleSaveFunc,
  meaning,
}) => {
  const [hoveredXStates, setHoveredXStates] = useState('');

  const handleAddIndexToArr = (index) => {
    setHoveredXStates(index);
  };

  const handleOnMouseExit = (index) => {
    if (hoveredXStates === index) {
      setTimeout(() => setHoveredXStates(''), 2000);
    }
  };

  return (
    <div>
      <ul className='flex flex-wrap'>
        {vocab.map(({ surfaceForm, meaning }, index) => {
          const wordIsSaved = thisSentencesSavedWords?.some(
            (item) => item.text === surfaceForm,
          );

          const thisColor = getColorByIndex(index);

          return (
            <li
              key={index}
              id={`vocab-${index}`}
              className='relative'
              onMouseEnter={() => handleAddIndexToArr(index)}
              onMouseLeave={() => handleOnMouseExit(index)}
            >
              {wordIsSaved ? (
                <div
                  className={clsx('flex gap-0.5 flex-col')}
                  style={{
                    color: thisColor,
                  }}
                >
                  <span className={clsx(wordIsSaved && 'underline', 'm-auto')}>
                    {surfaceForm}
                  </span>
                </div>
              ) : (
                <BreakSentenceHoverCard
                  handleSaveFunc={handleSaveFunc}
                  surfaceForm={surfaceForm}
                  meaning={meaning}
                  thisColor={thisColor}
                  wordIsSaved={wordIsSaved}
                />
              )}
            </li>
          );
        })}
      </ul>
      <hr className='m-1' />
      <ul className='flex flex-wrap gap-1'>
        {vocab.map(({ meaning }, index) => {
          const isInHoveredState = hoveredXStates === index;

          return (
            <li
              key={index}
              id={`structure-${index}`}
              className={clsx(
                isInHoveredState
                  ? 'border-neutral-900 border-[1px] rounded font-bold'
                  : '',
              )}
            >
              <div
                className='flex gap-0.5 flex-col'
                style={{
                  color: getColorByIndex(index),
                }}
              >
                <span className='m-auto' style={{ fontSize: 12 }}>
                  {meaning}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {/* <p>{sentenceStructure}</p> */}
      {vocab.map((_, index) => {
        const isInHoveredState = hoveredXStates === index;

        if (!isInHoveredState) return null;
        return (
          <Xarrow
            key={index}
            start={`vocab-${index}`}
            end={`structure-${index}`}
            strokeWidth={2}
            color={getColorByIndex(index)}
            showHead={false}
          />
        );
      })}

      <hr className='m-1' />
      <p>{meaning}</p>
    </div>
  );
};
