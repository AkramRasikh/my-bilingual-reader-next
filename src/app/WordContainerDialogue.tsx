import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WordCardContent } from './WordCard';
import useData from './useData';
import { isDueCheck } from './DataProvider';
import clsx from 'clsx';
import WordTabContent from './WordTabContent';

export const WordDialogueContent = () => {
  const {
    wordsForSelectedTopic,
    wordBasketState,
    setWordBasketState,
    updateWordDataProvider,
  } = useData();

  const addWordToBasket = (word) => {
    const wordIsInBasic = wordBasketState.some(
      (wordItem) => wordItem?.id === word.id,
    );

    if (wordIsInBasic) {
      const updatedBasket = wordBasketState.filter(
        (item) => item.id !== word.id,
      );
      setWordBasketState(updatedBasket);
      return;
    }

    setWordBasketState((prev) => [...prev, word]);
  };

  return (
    <div className='text-center m-auto p-1.5'>
      <ul className='flex flex-wrap gap-2.5'>
        {wordsForSelectedTopic.map((word, index) => {
          const isInBasket = wordBasketState?.some((i) => i?.id === word.id);

          return (
            <li key={word.id}>
              <WordTabContent
                {...word}
                indexNum={index + 1}
                updateWordData={updateWordDataProvider}
                addWordToBasket={addWordToBasket}
                isInBasket={isInBasket}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const WordContainerDialogue = ({ wordsForSelectedTopic, addWordToBasket }) => {
  const { wordBasketState, updateWordDataProvider } = useData();
  const nowTime = new Date();
  const howManyDue = wordsForSelectedTopic.filter((i) =>
    isDueCheck(i, nowTime),
  ).length;

  const btnText = howManyDue
    ? `Words (${howManyDue}/${wordsForSelectedTopic.length})`
    : `Words ${wordsForSelectedTopic.length}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className={clsx(howManyDue > 0 ? 'bg-amber-500' : '')}
        >
          {btnText}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordContainerDialogue;
