import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import clsx from 'clsx';

const WordCardHeader = ({ textTitle, isInBasket, onClick }) => (
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

    <Button
      variant={isInBasket ? 'destructive' : 'default'}
      className={clsx(!isInBasket ? 'bg-transparent' : '')}
      onClick={onClick}
    >
      🧺
    </Button>
  </div>
);

export default WordCardHeader;
