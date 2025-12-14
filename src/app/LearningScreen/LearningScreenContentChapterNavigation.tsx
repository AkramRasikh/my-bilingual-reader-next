import { useEffect, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';

const LearningScreenContentChapterNavigation = () => {
  const [sentenceRepsPerMinState, setSentenceRepsPerMinState] = useState<
    string | null
  >(null);

  const { sentenceRepsState, elapsed } = useLearningScreen();

  const prevValueSentencesRef = useRef(sentenceRepsState);

  useEffect(() => {
    if (elapsed > 0 && sentenceRepsState !== prevValueSentencesRef.current) {
      prevValueSentencesRef.current = sentenceRepsState;
      const perMinute = (sentenceRepsState / elapsed) * 60;
      setSentenceRepsPerMinState(perMinute.toFixed(1));
    }
  }, [sentenceRepsState, elapsed]);

  return (
    <LearningScreenUnifiedAnalytics
      sentenceRepsPerMinState={sentenceRepsPerMinState}
    />
  );
};

export default LearningScreenContentChapterNavigation;
