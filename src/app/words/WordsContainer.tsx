'use client';

import { useEffect, useState } from 'react';
import WordCard from '../WordCard';
import useWords from './useWords';
import LoadingSpinner from '../LoadingSpinner';
import StoryBasket from './StoryBasket';
import StoryComponent from './StoryComponent';

const WordsContainer = () => {
  const [story, setStory] = useState();
  const [initial30State, setInitial30State] = useState([]);
  const [loading, setLoading] = useState(false);

  const { wordBasketState, setWordBasketState, wordsState } = useWords();

  console.log('## story', story);

  const getStoryAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/getAiStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: wordBasketState, speakerId: 13 }),
      });

      const data = await res.json();
      console.log('## data', data);

      if (data) {
        setStory(data);
      } else {
        setStory('No story returned.');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setStory('Error fetching story.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wordsState) {
      setInitial30State([...wordsState].slice(0, 30));
    }
  }, [wordsState]);

  return (
    <div>
      <h1 className='text-center p-1'>
        Yah Dun Kno Words! {wordsState.length}
      </h1>

      {wordBasketState?.length > 0 && (
        <StoryBasket
          getStoryAPI={getStoryAPI}
          story={story}
          setStory={setStory}
        />
      )}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        >
          <LoadingSpinner />
        </div>
      )}
      {story && <StoryComponent story={story} />}
      <ul className='flex flex-wrap gap-2.5'>
        {initial30State?.map((word, index) => {
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
