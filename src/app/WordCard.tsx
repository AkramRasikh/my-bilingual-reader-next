'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import useWords from './words/useWords';
import ReviewSRSToggles from './ReviewSRSToggles';
import { Label } from '@/components/ui/label';

const WordCard = ({
  baseForm,
  id,
  definition,
  surfaceForm,
  phonetic,
  transliteration,
  defaultOpen = false,
  ...rest
}) => {
  const [openContentState, setOpenContentState] = useState(defaultOpen);
  const { addWordToBasket, wordBasketState, updateWordData } = useWords();

  const isInBasket = wordBasketState?.some((i) => i?.id === id);
  return (
    <Card
      className='w-fit p-3'
      style={{
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
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
          🧺
        </Button>
        <Button onClick={() => setOpenContentState(!openContentState)}>
          ⠇
        </Button>
      </div>
      {openContentState && (
        <>
          <hr />
          <CardContent
            style={{
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          >
            <div className='flex flex-col gap-3 mb-4'>
              {surfaceForm && <Label>Surface Form: {surfaceForm}</Label>}
              {phonetic && <Label>Phonetic: {phonetic}</Label>}
              {transliteration && (
                <Label>Transliteration: {transliteration}</Label>
              )}
              {definition && <Label>Definition: {definition}</Label>}
            </div>
            <ReviewSRSToggles
              contentItem={{
                id,
                ...rest,
              }}
              handleReviewFunc={updateWordData}
              isVocab
            />
          </CardContent>
        </>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
};

export default WordCard;
