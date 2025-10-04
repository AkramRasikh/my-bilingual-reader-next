import clsx from 'clsx';
import getColorByIndex from '@/utils/get-color-by-index';

const SentenceBreakdownSyntacticStructure = ({ vocab, hoveredXStates }) => (
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
);

export default SentenceBreakdownSyntacticStructure;
