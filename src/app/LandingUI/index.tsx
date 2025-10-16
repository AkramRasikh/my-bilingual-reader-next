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
    const buttonsArr = [
      {
        onClick: () => setIsSentenceReviewState(true),
        disabled: !(numberOfSentences > 0),
        variant: 'secondary',
        text: `Sentence reviews (${numberOfSentences})`,
      },
    ];
    return (
      <WordsStudyUIProvider>
        <BreadCrumbHeaderBase
          heading={'Home'}
          onClick={() => setIsWordStudyState(false)}
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

        <WordsStudyUI />
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
