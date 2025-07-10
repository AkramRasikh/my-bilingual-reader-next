'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const WordCard = ({ baseForm }) => {
  const [openContentState, setOpenContentState] = useState(false);
  return (
    <Card className='w-fit p-3'>
      <div className='flex gap-3'>
        <CardTitle className='m-auto'>{baseForm}</CardTitle>
        <Button>EASY</Button>
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
