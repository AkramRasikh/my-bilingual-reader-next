import { useEffect, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

const LearningScreenContentChapterNavigation = () => {
  const [sentenceRepsPerMinState, setSentenceRepsPerMinState] = useState<
    string | null
  >(null);
  const [wordRepsPerMinState, setWordRepsPerMinState] = useState<string | null>(
    null,
  );

  const { sentenceRepsState, wordRepsState, elapsed } = useLearningScreen();

  const prevValueSentencesRef = useRef(sentenceRepsState);
  const prevValueWordsRef = useRef(wordRepsState);

  useEffect(() => {
    if (elapsed > 0 && sentenceRepsState !== prevValueSentencesRef.current) {
      prevValueSentencesRef.current = sentenceRepsState;
      const perMinute = (sentenceRepsState / elapsed) * 60;
      setSentenceRepsPerMinState(perMinute.toFixed(1));
    }
  }, [sentenceRepsState, elapsed]);

  useEffect(() => {
    if (elapsed > 0 && wordRepsState !== prevValueWordsRef.current) {
      prevValueWordsRef.current = wordRepsState;
      const perMinute = (wordRepsState / elapsed) * 60;
      setWordRepsPerMinState(perMinute.toFixed(1));
    }
  }, [wordRepsState, elapsed]);

  return (
    <div className='flex flex-col items-center gap-2'>
      <LearningScreenUnifiedAnalytics
        sentenceRepsPerMinState={sentenceRepsPerMinState}
        wordRepsPerMinState={wordRepsPerMinState}
      />

      <LearningScreenActionBarVideoControls />
    </div>
  );
};

export default LearningScreenContentChapterNavigation;
