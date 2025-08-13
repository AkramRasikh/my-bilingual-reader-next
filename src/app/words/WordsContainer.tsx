'use client';

import { useEffect, useState } from 'react';
import WordCard from '../WordCard';
import useWords from './useWords';
import StoryBasket from './StoryBasket';
import StoryComponent from './StoryComponent';

const WordsContainer = () => {
  const [initial30State, setInitial30State] = useState([]);
  const [loading, setLoading] = useState(false);

  const { wordBasketState, wordsState, story, setStory } = useWords();

  const getStoryAPI = async ({ isStory }) => {
    setLoading(true);
    try {
      const res = await fetch(
        isStory ? '/api/getAiStory' : '/api/getDialogue',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words: wordBasketState, speakerId: 37 }),
        },
      );

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
      setInitial30State([...wordsState].slice(0, 20));
    }
  }, [wordsState]);

  const storiesId = story?.wordIds;

  const storiesWordBlocks = initial30State?.filter((i) =>
    storiesId?.includes(i.id),
  );

  return (
    <div>
      <h1 className='text-center p-1'>
        Yah Dun Kno Words! {wordsState.length}
      </h1>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 1000,
          }}
        >
          <div className='h-20 w-20 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
        </div>
      )}
      <ul className='flex flex-wrap gap-2.5'>
        {storiesWordBlocks?.map((word, index) => {
          return (
            <li key={index}>
              <WordCard {...word} defaultOpen />
            </li>
          );
        })}
      </ul>

      <StoryBasket
        getStoryAPI={getStoryAPI}
        story={story}
        setStory={setStory}
      />

      {story && <StoryComponent story={story} />}
      <ul className='flex flex-wrap gap-2.5'>
        {initial30State?.map((word, index) => {
          if (storiesId?.includes(word.id)) {
            return null;
          }
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
