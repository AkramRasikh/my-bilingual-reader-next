import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { HistoryIcon } from 'lucide-react';
import { useMemo } from 'react';
import { isDueCheck } from '@/utils/is-due-check';

const LearningScreenUnifiedAnalytics = ({ sentenceRepsPerMinState }) => {
  const {
    contentMetaMemoized,
    contentMetaWordMemoized,
    sentenceRepsState,
    numberOfSentencesPendingOrDueState,
    setSentenceRepsState,
    contentSnippets,
  } = useLearningScreen();
  const sentencesNeedReview = contentMetaMemoized[0]?.sentencesNeedReview;

  const handleClearReps = () => {
    setSentenceRepsState(0);
  };

  const numberOfDueSnippets = useMemo(() => {
    if (contentSnippets.length === 0) {
      return [];
    }

    return contentSnippets.filter((item) => isDueCheck(item));
  }, [contentSnippets]).length;

  return (
    <div>
      <p className='text-xs font-medium m-auto w-fit'>
        Sentences: {sentencesNeedReview}/{numberOfSentencesPendingOrDueState}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Words Due: {contentMetaWordMemoized[0].length}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Snippets Due: {numberOfDueSnippets}/{contentSnippets.length}
      </p>
      <hr className='my-1' />
      <p className='flex gap-2 text-xs font-medium  w-fit m-auto'>
        <span className='m-auto'>Reps: {sentenceRepsState}</span>
        {sentenceRepsState ? (
          <Button
            className='w-5 h-5'
            variant='destructive'
            onClick={handleClearReps}
          >
            <HistoryIcon />
          </Button>
        ) : null}
      </p>
      {sentenceRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {sentenceRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default LearningScreenUnifiedAnalytics;
