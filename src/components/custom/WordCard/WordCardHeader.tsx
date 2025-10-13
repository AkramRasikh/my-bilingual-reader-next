import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import clsx from 'clsx';
import { LucidePlay, MoreVerticalIcon } from 'lucide-react';

const WordCardHeader = ({
  textTitle,
  isInBasket,
  onClickBasket,
  onClickPlayContext,
  setOpenContentState,
  openContentState,
}) => (
  <div className='flex gap-3 flex-wrap justify-between'>
    <CardTitle
      style={{
        overflow: 'hidden',
        maxWidth: '27ch',
      }}
      className='my-auto text-ellipsis text-left'
    >
      {textTitle}
    </CardTitle>

    <div className='my-auto flex gap-2'>
      <Button
        variant={'secondary'}
        className={'h-3 w-3 p-3 bg-transparent'}
        onClick={onClickPlayContext}
      >
        <LucidePlay />
      </Button>
      <Button
        variant={'secondary'}
        className={'h-3 w-3 p-3 bg-transparent'}
        onClick={() => setOpenContentState(!openContentState)}
      >
        <MoreVerticalIcon />
      </Button>
      <Button
        variant={isInBasket ? 'destructive' : 'default'}
        className={clsx(!isInBasket ? 'bg-transparent' : '', 'h-3 w-3 p-3')}
        onClick={onClickBasket}
      >
        🧺
      </Button>
    </div>
  </div>
);

export default WordCardHeader;
