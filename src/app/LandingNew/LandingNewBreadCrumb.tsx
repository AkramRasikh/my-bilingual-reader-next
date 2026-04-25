'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCwIcon } from 'lucide-react';
import { VariantProps } from 'class-variance-authority';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { Button, buttonVariants } from '@/components/ui/button';
import { isDueCheck } from '@/utils/is-due-check';
import { arabic, chinese, french, japanese } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import { ContentTranscriptTypes } from '@/app/types/content-types';
import { useFetchData } from '../Providers/FetchDataProvider';

interface NavgationButtonsType {
  href: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  text: string;
  disabled?: boolean;
}

const supportedLanguages = [japanese, arabic, chinese, french];

const safeParseArray = <T,>(value: string | null): T[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as T[] | null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const LandingNewBreadCrumb = () => {
  const { setToastMessageState } = useFetchData();
  const [isLocalStorageClearedState, setIsLocalStorageClearedState] =
    useState(false);

  const dateNow = new Date();
  const { dueSentencesTotal, dueWordsTotal } = supportedLanguages.reduce(
    (acc, language) => {
      const wordsState = safeParseArray<WordTypes>(
        localStorage.getItem(`${language}-wordsState`),
      );
      const sentencesState = safeParseArray<ContentTranscriptTypes>(
        localStorage.getItem(`${language}-sentencesState`),
      );

      acc.dueWordsTotal += wordsState.filter((item) => isDueCheck(item, dateNow)).length;
      acc.dueSentencesTotal += sentencesState.filter((item) =>
        isDueCheck(item, dateNow),
      ).length;

      return acc;
    },
    { dueSentencesTotal: 0, dueWordsTotal: 0 },
  );

  const handleClearLocalStorage = () => {
    supportedLanguages.forEach((language) => {
      localStorage.removeItem(`${language}-wordsState`);
      localStorage.removeItem(`${language}-sentencesState`);
      localStorage.removeItem(`${language}-contentState`);
    });

    setToastMessageState('LocalStorage cleared ✅');
    setIsLocalStorageClearedState(true);
  };

  const buttonsArr: NavgationButtonsType[] = [
    {
      href: '#',
      disabled: true,
      variant: 'link',
      text: `Sentence (${dueSentencesTotal})`,
    },
    {
      href: '#',
      disabled: true,
      variant: 'link',
      text: `Words (${dueWordsTotal})`,
    },
    {
      href: '/youtube-upload',
      variant: 'link',
      text: 'Content',
    },
  ];

  return (
    <div className='flex justify-between'>
      <BreadCrumbHeaderBase
        heading=''
        onClick={() => {}}
        navigationButtons={() =>
          buttonsArr.map((item, index) =>
            item.disabled ? (
              <Button
                key={index}
                className='m-1.5'
                disabled={true}
                variant={item.variant}
              >
                {item.text}
              </Button>
            ) : (
              <Button key={index} className='m-1.5' variant={item.variant} asChild>
                <Link href={item.href}>{item.text}</Link>
              </Button>
            ),
          )
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
      </div>
    </div>
  );
};

export default LandingNewBreadCrumb;
