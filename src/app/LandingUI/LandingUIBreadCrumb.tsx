'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LanguageSelector from '@/components/custom/LanguageSelector';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';

const LandingUIBreadCrumb = () => {
  const [showBasketState, setShowBasketState] = useState(false);

  const {
    wordBasketState,
    languageSelectedState,
    setLanguageSelectedState,
    wordsForReviewMemoized,
    sentencesDueForReviewMemoized,
  } = useFetchData();

  const router = useRouter();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfSentences = sentencesDueForReviewMemoized.length;

  const firstHeader = 'Home';

  const buttonsArr = [
    {
      onClick: () => router.push('/sentences'),
      disabled: !(numberOfSentences > 0),
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
    },
    {
      onClick: () => router.push('/words'),
      disabled: !(wordsForReviewMemoized.length > 0),
      variant: 'link',
      text: `Words (${wordsForReviewMemoized.length})`,
    },
    {
      onClick: () => router.push('/youtube-upload'),
      variant: 'link',
      text: 'Content',
    },
  ];

  return (
    <div className='flex justify-between'>
      <BreadCrumbHeaderBase
        heading={firstHeader}
        onClick={() => {}}
        navigationButtons={() =>
          buttonsArr.map((item, index) => {
            return (
              <Button
                key={index}
                className='m-1.5'
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.variant}
              >
                {item.text}
              </Button>
            );
          })
        }
      />
      <LanguageSelector
        defaultValue={languageSelectedState}
        onChange={setLanguageSelectedState}
      />
    </div>
  );
};

export default LandingUIBreadCrumb;
