'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LanguageSelector from '@/components/custom/LanguageSelector';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';

interface NavgationButtonsType {
  href: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  text: string;
  disabled?: boolean;
}
const LandingUIBreadCrumb = () => {
  const [showBasketState, setShowBasketState] = useState(false);

  const {
    wordBasketState,
    languageSelectedState,
    setLanguageSelectedState,
    wordsForReviewMemoized,
    sentencesDueForReviewMemoized,
  } = useFetchData();

  useEffect(() => {
    if (wordBasketState.length === 0 && showBasketState) {
      setShowBasketState(false);
    }
  }, [wordBasketState, showBasketState]);

  const numberOfSentences = sentencesDueForReviewMemoized.length;

  const firstHeader = 'Home';

  const buttonsArr = [
    {
      href: '#',
      disabled: true,
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
    },
    {
      href: '/words',
      disabled: !(wordsForReviewMemoized.length > 0),
      variant: 'link',
      text: `Words (${wordsForReviewMemoized.length})`,
    },
    {
      href: '/youtube-upload',
      variant: 'link',
      text: 'Content',
    },
  ] as NavgationButtonsType[];

  return (
    <div className='flex justify-between'>
      <BreadCrumbHeaderBase
        heading={firstHeader}
        onClick={() => {}}
        navigationButtons={() =>
          buttonsArr.map((item, index) => {
            return item.disabled ? (
              <Button
                key={index}
                className='m-1.5'
                disabled={true}
                variant={item.variant}
              >
                {item.text}
              </Button>
            ) : (
              <Button
                key={index}
                className='m-1.5'
                variant={item.variant}
                asChild
              >
                <Link href={item.href}>{item.text}</Link>
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
