'use client';
import { useEffect } from 'react';
import LearningScreen from '../LearningScreen';
import useData from '../Providers/useData';
import LandingUIContentSelection from './LandingUIContentSelection';
import { LearningScreenProvider } from '../LearningScreen/LearningScreenProvider';
import { toast } from 'sonner';
import SentencesUIContainer from '../sentences/SentencesUIContainer';
import MockFlag from '../../components/custom/MockFlag';
import useLandingScreenLoadGeneralTopicsDisplay from './useLandingUILoadGeneralTopicsDisplay';
import BreadcrumbComponent from '../../components/custom/BreadCrumbHeader';
import { Button } from '@/components/ui/button';
import { CrossIcon } from 'lucide-react';
import { WordsStudyUIProvider } from '../WordsStudyUI/WordsStudyUIProvider';
import WordsStudyUI from '../WordsStudyUI';

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
    wordsState,
  } = useData();

  useEffect(() => {
    if (toastMessageState) {
      toast(toastMessageState);
      setTimeout(() => setToastMessageState(''), 1000);
    }
  }, [toastMessageState]);

  useLandingScreenLoadGeneralTopicsDisplay();

  const numberOfSentences = sentencesState.length;

  if (isWordStudyState && wordsState.length > 0) {
    return (
      <WordsStudyUIProvider>
        <div className='relative'>
          <Button
            onClick={() => setIsWordStudyState(false)}
            className='absolute right-1/12 '
          >
            <CrossIcon />
          </Button>
          <WordsStudyUI />
        </div>
      </WordsStudyUIProvider>
    );
  }

  if (isSentenceReviewState && sentencesState.length > 0) {
    return (
      <div>
        <Button onClick={() => setIsSentenceReviewState(false)}>
          <CrossIcon />
        </Button>
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
