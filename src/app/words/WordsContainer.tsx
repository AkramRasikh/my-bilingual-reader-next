'use client';

import { useState } from 'react';
import WordCard from '../WordCard';
import useWords from './useWords';
import { Button } from '@/components/ui/button';
import { KaraokePlayer } from './KaraokePlayer';
import LoadingSpinner from '../LoadingSpinner';

const WordsContainer = ({ words }) => {
  const [wordsState, setWordsState] = useState(words);
  const [story, setStory] = useState();
  const [loading, setLoading] = useState(false);

  const { wordBasketState, setWordBasketState } = useWords();

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

  const initial30Words = wordsState.slice(0, 30);

  return (
    <div>
      {wordBasketState?.length > 0 && (
        <>
          <ul className='flex flex-wrap gap-2.5'>
            {wordBasketState?.map((word, index) => {
              return (
                <li key={index}>
                  <span>
                    {index + 1}) {word.word}
                  </span>
                </li>
              );
            })}
          </ul>
          <hr />
          <Button onClick={getStoryAPI}>Get Story!</Button>
        </>
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
      {story && (
        <Button
          variant='destructive'
          className='m-1'
          onClick={() => {
            setWordBasketState([]);
            setStory();
          }}
        >
          Clear story
        </Button>
      )}
      {story && (
        <>
          <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
            🇯🇵{story.targetLang}
          </p>
          <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
            🇬🇧{story.baseLang}
          </p>
          {story?.notes && (
            <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
              👀{story.notes}
            </p>
          )}
        </>
      )}
      {story?.audioUrl && (
        <KaraokePlayer
          originalText={story?.targetLang}
          audioUrl={story?.audioUrl}
          audioQuery={story?.audioQuery}
          katakanaSentence={story?.katakana}
          chunks={story?.chunks}
        />
      )}
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
