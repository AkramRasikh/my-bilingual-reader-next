'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import useLearningScreen from './useLearningScreen';
import BreadCrumbHeaderBase from '../../components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';
import LanguageSelector from '../../components/custom/LanguageSelector';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import ProgressHeader from '../../components/custom/ProgressHeader';
import { RefreshCwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const LearningScreenBreadCrumbHeader = () => {
  const { selectedContentState, initialSentenceCount, sentencesNeedReview } =
    useLearningScreen();

  const {
    languageSelectedState,
    setLanguageSelectedState,
    setToastMessageState,
    wordsForReviewMemoized,
    sentencesDueForReviewMemoized,
  } = useFetchData();
  const [isLocalStorageClearedState, setIsLocalStorageClearedState] =
    useState(false);

  const router = useRouter();

  // totalItems: starts at initial count, increases if new items are added
  const totalItems = Math.max(initialSentenceCount ?? 0, sentencesNeedReview);
  const remainingItems = sentencesNeedReview;
  const completedItems = totalItems - remainingItems;
  const progressValue =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const progressText = `${completedItems}/${totalItems}`;

  const numberOfSentences = sentencesDueForReviewMemoized.length;
  const title = selectedContentState.title;

  const firstHeader = 'Home';
  useEffect(() => {
    setIsLocalStorageClearedState(false);
  }, [languageSelectedState]);

  const handleOnHome = () => router.push('/');
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

  const buttonsArr: Array<{
    onClick: () => void;
    disabled?: boolean;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    text: string;
    dataTestId: string;
  }> = [
    {
      onClick: () => {},
      disabled: true,
      variant: 'link',
      text: `Sentence (${numberOfSentences})`,
      dataTestId: 'breadcrumb-sentences-button',
    },
    {
      onClick: () => {},
      disabled: true,
      variant: 'link',
      text: `Words (${wordsForReviewMemoized.length})`,
      dataTestId: 'breadcrumb-words-button',
    },
    {
      onClick: () => router.push('/youtube-upload'),
      variant: 'link',
      text: 'Content',
      dataTestId: 'breadcrumb-content-button',
    },
  ];

  return (
    <div className='flex justify-between'>
      <BreadCrumbHeaderBase
        heading={firstHeader}
        onClick={handleOnHome}
        subHeading={title}
        navigationButtons={() =>
          buttonsArr.map((item, index) => {
            return (
              <Button
                key={index}
                className='m-1.5'
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.variant}
                data-testid={item.dataTestId}
              >
                {item.text}
              </Button>
            );
          })
        }
        progressHeaderComponent={
          sentencesNeedReview
            ? () => (
                <ProgressHeader
                  progressState={progressValue}
                  progressText={progressText}
                  small
                />
              )
            : undefined
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

export default LearningScreenBreadCrumbHeader;
