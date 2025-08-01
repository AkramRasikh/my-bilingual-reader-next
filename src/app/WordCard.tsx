'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import useWords from './words/useWords';

const WordCard = ({ baseForm, id, definition }) => {
  const [openContentState, setOpenContentState] = useState(false);
  const { addWordToBasket } = useWords();
  return (
    <Card className='w-fit p-3'>
      <div className='flex gap-3'>
        <CardTitle className='m-auto'>{baseForm}</CardTitle>
        <Button>EASY</Button>
        <Button
          onClick={() =>
            addWordToBasket({
              word: baseForm,
              id,
              definition,
            })
          }
        >
          Add to 🗑️
        </Button>
        <Button onClick={() => setOpenContentState(!openContentState)}>
          ⠇
        </Button>
      </div>
      {openContentState && (
        <CardContent>
          <h2>Siu! {baseForm}</h2>
        </CardContent>
      )}
    </Card>
  );
};

export default WordCard;
