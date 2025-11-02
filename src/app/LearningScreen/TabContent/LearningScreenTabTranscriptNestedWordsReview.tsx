import WordCard from '@/components/custom/WordCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useLearningScreen from '../useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { useState } from 'react';

const LearningScreenTabTranscriptNestedWordsReview = ({
  sentencesForReviewMemoized,
}) => {
  const [showNestedRelevantWordsState, setShowNestedRelevantWordsState] =
    useState(true);
  const { playFromThisContext } = useLearningScreen();
  const {
    languageSelectedState,
    wordBasketState,
    updateWordDataProvider,
    addWordToBasket,
    addImageDataProvider,
  } = useFetchData();
  return (
    <>
      <div className='flex gap-2 m-auto justify-center p-1'>
        <Label className='text-sm font-medium'>Show Relevant Words</Label>
        <Switch
          checked={showNestedRelevantWordsState}
          onCheckedChange={setShowNestedRelevantWordsState}
        />
      </div>

      {showNestedRelevantWordsState && (
        <div className='text-center m-auto p-1.5'>
          <ul className='flex flex-wrap gap-2.5 m-auto'>
            {sentencesForReviewMemoized.map((word, index) => {
              const isInBasket = wordBasketState?.some(
                (i) => i?.id === word.id,
              );

              return (
                <li key={word.id} className='mx-auto'>
                  <WordCard
                    {...word}
                    indexNum={index + 1}
                    updateWordData={updateWordDataProvider}
                    addWordToBasket={addWordToBasket}
                    isInBasket={isInBasket}
                    addImageDataProvider={addImageDataProvider}
                    playFromThisContext={playFromThisContext}
                    languageSelectedState={languageSelectedState}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default LearningScreenTabTranscriptNestedWordsReview;
