import { Button } from '@/components/ui/button';
import useWords from './useWords';

const StoryBasket = ({ getStoryAPI, story, setStory }) => {
  const { wordBasketState, setWordBasketState } = useWords();
  return (
    <div className='flex justify-around mb-5'>
      <ul className='flex flex-wrap gap-2.5 mt-auto mb-auto'>
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
      <div className='flex gap-2'>
        {wordBasketState?.length && (
          <Button variant='destructive' onClick={() => setWordBasketState([])}>
            Clear Basket
          </Button>
        )}
        {story ? (
          <Button variant='destructive' onClick={() => setStory()}>
            Clear Story
          </Button>
        ) : (
          <Button onClick={getStoryAPI}>Get Story!</Button>
        )}
      </div>
    </div>
  );
};

export default StoryBasket;
