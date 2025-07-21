import clsx from 'clsx';
import { useState } from 'react';
import Xarrow from 'react-xarrows';

const colors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

function getColorByIndex(index) {
  return colors[index % colors.length];
}

export const NewSentenceBreakdown = ({ vocab, sentenceStructure }) => {
  const [hoveredXStates, setHoveredXStates] = useState('');

  const handleAddIndexToArr = (index) => {
    setHoveredXStates(index);
    setTimeout(() => setHoveredXStates(''), 2000);
  };

  return (
    <div>
      <ul className='flex flex-wrap gap-1'>
        {vocab.map(({ surfaceForm }, index) => {
          return (
            <li key={index} id={`vocab-${index}`}>
              <div
                className='flex gap-0.5 flex-col'
                onMouseEnter={() => handleAddIndexToArr(index)}
                style={{
                  color: getColorByIndex(index),
                }}
              >
                <span className='m-auto'>{surfaceForm}</span>
              </div>
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
                isInHoveredState ? 'animate-pulse font-bold underline' : '',
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
      <p>{sentenceStructure}</p>
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
    </div>
  );
};

const SentenceBreakdown = ({
  vocab,
  meaning,
  thisSentencesSavedWords,
  handleSaveFunc,
}) => {
  return (
    <div>
      <ul className='flex flex-wrap gap-2 justify-center'>
        {vocab.map(({ surfaceForm, meaning }, index) => {
          const wordIsSaved = thisSentencesSavedWords?.some(
            (item) => item.text === surfaceForm,
          );
          return (
            <li key={index}>
              <div
                className='flex flex-col'
                style={{
                  color: getColorByIndex(index),
                }}
              >
                <span className='m-auto'>{surfaceForm}</span>
                <span className='m-auto' style={{ fontSize: 12 }}>
                  {meaning}
                </span>
                {!wordIsSaved && (
                  <div className='flex gap-1.5 m-auto'>
                    <button
                      className='border'
                      style={{
                        padding: 5,
                        borderRadius: 5,
                      }}
                      onClick={() =>
                        handleSaveFunc(false, surfaceForm, meaning)
                      }
                    >
                      <img
                        src='/deepseek.png'
                        alt='Deepseek logo'
                        className='h-2'
                      />
                    </button>
                    <button
                      className='border'
                      style={{
                        padding: 5,
                        borderRadius: 5,
                      }}
                      onClick={() => handleSaveFunc(true, surfaceForm, meaning)}
                    >
                      <img
                        src='/google.png'
                        alt='Google logo'
                        className='h-2'
                      />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p>Translation: {meaning}</p>
    </div>
  );
};

export default SentenceBreakdown;
