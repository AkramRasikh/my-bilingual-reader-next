'use client';
import { useEffect } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../Providers/useData';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast, Toaster } from 'sonner';
import SentencesUIContainer from '../sentences/SentencesUIContainer';
import MockFlag from '../../components/custom/MockFlag';
import useLandingScreenLoadGeneralTopicsDisplay from './useLandingUILoadGeneralTopicsDisplay';
import BreadcrumbComponent from '../../components/custom/BreadCrumbHeader';
import { Button } from '@/components/ui/button';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUI from '../WordsStudyUI';
import BreadCrumbHeaderBase from '@/components/BreadCrumbHeaderBase';

const LandingScreen = () => {
  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  const {
    generalTopicDisplayNameState,
    generalTopicDisplayNameSelectedState,
    sentencesState,
    toastMessageState,
    setToastMessageState,
    isSentenceReviewState,
    setIsSentenceReviewState,
    isWordStudyState,
    setIsWordStudyState,
    wordsForReviewState,
    wordsState,
    wordsToReviewOnMountState,
  } = useData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  useLandingScreenLoadGeneralTopicsDisplay();

  const numberOfSentences = sentencesState.length;
  const buttonsArr = [
    {
      onClick: () => setIsSentenceReviewState(true),
      disabled: !(numberOfSentences > 0),
      variant: 'secondary',
      text: `Sentence reviews (${numberOfSentences})`,
    },
    {
      onClick: () => setIsWordStudyState(true),
      disabled: !(wordsForReviewState.length > 0),
      variant: 'secondary',
      text: `Words due (${wordsForReviewState.length})`,
    },
  ];

  if (isWordStudyState && wordsState.length > 0) {
    const wordStudySubHeading = `${
      wordsToReviewOnMountState - wordsForReviewState.length
    }/${wordsForReviewState.length} Studied`;
    return (
      <WordsStudyUIProvider>
        <Toaster position='top-center' />
        <BreadCrumbHeaderBase
          heading={'Home'}
          subHeading={wordStudySubHeading}
          onClick={() => setIsWordStudyState(false)}
          navigationButtons={() =>
            [buttonsArr[0]].map((item, index) => {
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
        <BreadCrumbHeaderBase
          heading={'Home'}
          onClick={() => setIsSentenceReviewState(false)}
          navigationButtons={() =>
            [buttonsArr[1]].map((item, index) => {
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
        generalTopicDisplayNameState={generalTopicDisplayNameState}
        isSentenceReviewState={isSentenceReviewState}
        setIsSentenceReviewState={setIsSentenceReviewState}
        numberOfSentences={numberOfSentences}
      />
      <LearningScreen />
    </LearningScreenProvider>
  );
};

export default LandingScreen;
