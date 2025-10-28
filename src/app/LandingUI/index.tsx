'use client';
import { useEffect, useMemo } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../Providers/useData';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast, Toaster } from 'sonner';
import SentencesUIContainer from '../sentences/SentencesUIContainer';
import MockFlag from '../../components/custom/MockFlag';
import BreadcrumbComponent from '../../components/custom/BreadCrumbHeader';
import { Button } from '@/components/ui/button';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUI from '../WordsStudyUI';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';
import { useRouter } from 'next/navigation';
import { SentencesUIProvider } from '../sentences/SentencesUIProvider';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    generalTopicDisplayNameMemoized,
    generalTopicDisplayNameSelectedState,
    sentencesState,
    toastMessageState,
    setToastMessageState,
    isSentenceReviewState,
    setIsSentenceReviewState,
    isWordStudyState,
    setIsWordStudyState,
    wordsForReviewMemoized,
    wordsState,
    wordsToReviewOnMountState,
  } = useData();

  const router = useRouter();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  const numberOfSentences = sentencesState.length;
  const sentenceReview = {
    onClick: () => setIsSentenceReviewState(true),
    disabled: !(numberOfSentences > 0),
    variant: 'secondary',
    text: `Sentence reviews (${numberOfSentences})`,
  };
  const wordReview = {
    onClick: () => setIsWordStudyState(true),
    disabled: !(wordsForReviewMemoized.length > 0),
    variant: 'secondary',
    text: `Words due (${wordsForReviewMemoized.length})`,
  };
  const addContent = {
    onClick: () => router.push('/youtube-upload'),
    variant: 'link',
    text: 'Add content',
  };

  if (isWordStudyState && wordsState.length > 0) {
    const wordStudySubHeading = `${
      wordsToReviewOnMountState - wordsForReviewMemoized.length
    }/${wordsForReviewMemoized.length} Studied`;
    return (
      <WordsStudyUIProvider>
        <Toaster position='top-center' />
        <BreadCrumbHeaderBase
          heading={'Home'}
          subHeading={wordStudySubHeading}
          onClick={() => setIsWordStudyState(false)}
          navigationButtons={() =>
            [sentenceReview, addContent].map((item, index) => {
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
        <WordsStudyUI />
      </WordsStudyUIProvider>
    );
  }

  if (isSentenceReviewState && sentencesState.length > 0) {
    return (
      <div>
        <SentencesUIProvider>
          <BreadCrumbHeaderBase
            heading={'Home'}
            onClick={() => setIsSentenceReviewState(false)}
            navigationButtons={() =>
              [wordReview, addContent].map((item, index) => {
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
          <SentencesUIContainer />
        </SentencesUIProvider>
      </div>
    );
  }

  return (
    <LearningScreenProvider>
      <BreadcrumbComponent />
      {isMockEnv && <MockFlag />}
      <LandingUIContentSelection
        generalTopicDisplayNameSelectedState={
          generalTopicDisplayNameSelectedState
        }
        generalTopicDisplayNameMemoized={generalTopicDisplayNameMemoized}
        isSentenceReviewState={isSentenceReviewState}
        setIsSentenceReviewState={setIsSentenceReviewState}
        numberOfSentences={numberOfSentences}
      />
      <LearningScreen />
    </LearningScreenProvider>
  );
};

export default LandingScreen;
