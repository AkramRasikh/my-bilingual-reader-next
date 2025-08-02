'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import useWords from './words/useWords';
import ReviewSRSToggles from './ReviewSRSToggles';

const WordCard = ({ baseForm, id, definition, ...rest }) => {
  const [openContentState, setOpenContentState] = useState(false);
  const { addWordToBasket, wordBasketState, updateWordData } = useWords();

  const isInBasket = wordBasketState?.some((i) => i?.id === id);
  return (
    <Card className='w-fit p-3'>
      <div className='flex gap-3'>
        <CardTitle className='m-auto'>{baseForm}</CardTitle>
        <Button>EASY</Button>
        <Button
          variant={isInBasket ? 'destructive' : 'default'}
          onClick={() =>
            addWordToBasket({
              word: baseForm,
              id,
              definition,
            })
          }
        >
          {isInBasket ? 'Remove from 🗑️' : 'Add to 🗑️'}
        </Button>
        <Button onClick={() => setOpenContentState(!openContentState)}>
          ⠇
        </Button>
      </div>
      {openContentState && (
        <CardContent>
          <ReviewSRSToggles
            contentItem={{
              id,
              ...rest,
            }}
            handleReviewFunc={updateWordData}
            isVocab
          />
        </CardContent>
      )}
    </Card>
  );
};

export default WordCard;
