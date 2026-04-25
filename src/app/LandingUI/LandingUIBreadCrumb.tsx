'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LanguageSelector from '@/components/custom/LanguageSelector';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { RefreshCwIcon } from 'lucide-react';

interface NavgationButtonsType {
  href: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  text: string;
  disabled?: boolean;
}
const LandingUIBreadCrumb = () => {
  const {
    languageSelectedState,
    setLanguageSelectedState,
    setToastMessageState,
    wordsForReviewMemoized,
    sentencesDueForReviewMemoized,
  } = useFetchData();
  const [isLocalStorageClearedState, setIsLocalStorageClearedState] =
    useState(false);

  const numberOfSentences = sentencesDueForReviewMemoized.length;

  useEffect(() => {
    setIsLocalStorageClearedState(false);
  }, [languageSelectedState]);

  const handleClearLocalStorage = () => {
    if (!languageSelectedState) {
      return;
    }
    localStorage.removeItem(`${languageSelectedState}-wordsState`);
    localStorage.removeItem(`${languageSelectedState}-sentencesState`);
    localStorage.removeItem(`${languageSelectedState}-contentState`);
    setToastMessageState('LocalStorage cleared ✅');
    setIsLocalStorageClearedState(true);
  };

  const buttonsArr = [
    //
    {
      href: '#',
      disabled: true,
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
    },
    {
      href: '#',
      disabled: true,
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
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleClearLocalStorage}
          disabled={isLocalStorageClearedState}
          className='relative'
          data-testid='breadcrumb-clear-local-storage-button'
        >
          <RefreshCwIcon />
          {isLocalStorageClearedState && (
            <span className='absolute -top-0.5 -right-0.5 text-[10px] leading-none'>
              ✅
            </span>
          )}
        </Button>
        <LanguageSelector
          defaultValue={languageSelectedState}
          onChange={setLanguageSelectedState}
        />
      </div>
    </div>
  );
};

export default LandingUIBreadCrumb;
