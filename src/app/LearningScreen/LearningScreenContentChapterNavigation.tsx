import { useMemo } from 'react';
import useLearningScreen from './useLearningScreen';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

const getRepsPerMinute = (reps: number, elapsed: number): string | null => {
  if (elapsed <= 0) {
    return null;
  }
  return ((reps / elapsed) * 60).toFixed(1);
};

const LearningScreenContentChapterNavigation = () => {
  const { sentenceRepsState, wordRepsState, snippetRepsState, elapsed } = useLearningScreen();

  const sentenceRepsPerMinState = useMemo(
    () => getRepsPerMinute(sentenceRepsState, elapsed),
    [sentenceRepsState, elapsed],
  );

  const wordRepsPerMinState = useMemo(
    () => getRepsPerMinute(wordRepsState, elapsed),
    [wordRepsState, elapsed],
  );
  const snippetRepsPerMinState = useMemo(
    () => getRepsPerMinute(snippetRepsState, elapsed),
    [snippetRepsState, elapsed],
  );

  return (
    <div className='flex flex-col items-center gap-2'>
      <LearningScreenUnifiedAnalytics
        sentenceRepsPerMinState={sentenceRepsPerMinState}
        wordRepsPerMinState={wordRepsPerMinState}
        snippetRepsPerMinState={snippetRepsPerMinState}
      />

      <LearningScreenActionBarVideoControls />
    </div>
  );
};

export default LearningScreenContentChapterNavigation;
