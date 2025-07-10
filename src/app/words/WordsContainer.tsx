'use client';

import { useState } from 'react';
import WordCard from '../WordCard';

const WordsContainer = ({ words }) => {
  const [wordsState, setWordsState] = useState(words);

  const initial30Words = wordsState.slice(0, 30);

  return (
    <div>
      <ul className='flex flex-wrap gap-2.5'>
        {initial30Words?.map((word, index) => {
          return (
            <li key={index}>
              <WordCard {...word} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default WordsContainer;
