import { useEffect, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

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
    <div className='flex flex-col items-center gap-2'>
      <LearningScreenUnifiedAnalytics
        sentenceRepsPerMinState={sentenceRepsPerMinState}
      />

      <LearningScreenActionBarVideoControls />
    </div>
  );
};

export default LearningScreenContentChapterNavigation;
