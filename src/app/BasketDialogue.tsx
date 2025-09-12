import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useData from './useData';
import LoadingSpinner from './LoadingSpinner';
import { useState } from 'react';
import StoryComponent from './words/StoryComponent';

const BasketDialogue = () => {
  const [loading, setLoading] = useState(false);
  const [valueState, setValueState] = useState('');

  const {
    wordBasketState,
    addGeneratedSentence,
    setWordBasketState,
    setStory,
    story,
  } = useData();
  // const nowTime = new Date();
  // const howManyDue = wordsForSelectedTopic.filter((i) =>
  //   isDueCheck(i, nowTime),
  // ).length;

  // const btnText = howManyDue
  //   ? `Words (${howManyDue}/${wordsForSelectedTopic.length})`
  //   : `Words ${wordsForSelectedTopic.length}`;
  // handleOpenBasket

  const getStoryAPI = async ({ isStory }) => {
    try {
      setLoading(true);
      const res = await fetch(
        isStory ? '/api/getAiStory' : '/api/getDialogue',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            words: wordBasketState,
            suggested: valueState,
          }),
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

  const removeFromBasket = (wordId) => {
    setWordBasketState((prev) => prev.filter((i) => i.id === wordId));
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={wordBasketState.length === 0}>
        <Button>Basket 🧺 ({wordBasketState.length})</Button>
      </DialogTrigger>
      <DialogContent className='max-h-200 overflow-scroll'>
        <DialogTitle>Basket:</DialogTitle>
        <div className='p-1.5 mx-0 my-auto'>
          <ul>
            {wordBasketState.map((basketItem, indexBasketItem) => (
              <li key={basketItem.id} className='flex gap-2'>
                <span className='my-auto'>
                  {indexBasketItem + 1}) {basketItem.word},{' '}
                  {basketItem.definition}
                </span>
                <Button onClick={removeFromBasket} variant='ghost' size='icon'>
                  ❌
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex gap-1.5 relative'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
              <LoadingSpinner />
            </div>
          )}
        </div>

        <div className='flex gap-1.5'>
          {story ? (
            <Button variant='destructive' onClick={() => setStory()}>
              Clear Story
            </Button>
          ) : (
            <div className='flex gap-2'>
              <Button onClick={() => getStoryAPI({ isStory: true })}>
                Get Story!
              </Button>
              <Button onClick={() => getStoryAPI({ isStory: false })}>
                Get Dialogue
              </Button>
            </div>
          )}
          <Button variant='destructive' onClick={() => setWordBasketState([])}>
            Clear Basket
          </Button>
        </div>

        <div className='flex flex-col items-start space-y-2 w-80'>
          <label htmlFor='name' className='text-sm font-medium text-gray-700'>
            Suggested sentence/theme
          </label>
          <input
            id='name'
            type='text'
            value={valueState}
            x-webkit-speech='true'
            onChange={(e) => setValueState(e.target.value)}
            placeholder='Type here...'
            className='w-full px-4 py-2 border rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          <p className='text-gray-500 text-sm'>You typed: {valueState}</p>
        </div>

        {story && (
          <StoryComponent
            story={story}
            addGeneratedSentence={addGeneratedSentence}
            wordBasketState={wordBasketState}
          />
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BasketDialogue;
