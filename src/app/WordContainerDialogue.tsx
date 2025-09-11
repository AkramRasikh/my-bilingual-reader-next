import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WordCardContent } from './WordCard';
import useData from './useData';

const WordContainerDialogue = ({ wordsForSelectedTopic, addWordToBasket }) => {
  const { wordBasketState, updateWordDataProvider } = useData();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          Show Words ({wordsForSelectedTopic.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Words:</DialogTitle>
        <div className='text-center m-auto p-1.5'>
          <ul className='flex flex-wrap gap-2.5'>
            {wordsForSelectedTopic.map((word) => {
              const isInBasket = wordBasketState?.some(
                (i) => i?.id === word.id,
              );

              return (
                <li key={word.id}>
                  <WordCardContent
                    {...word}
                    updateWordData={updateWordDataProvider}
                    addWordToBasket={addWordToBasket}
                    isInBasket={isInBasket}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit'>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordContainerDialogue;
