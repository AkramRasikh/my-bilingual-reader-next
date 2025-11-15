import { Button } from '@/components/ui/button';
import useLearningScreen from './useLearningScreen';
import { HistoryIcon } from 'lucide-react';

const LearningScreenUnifiedAnalytics = ({ sentenceRepsPerMinState }) => {
  const {
    contentMetaMemoized,
    contentMetaWordMemoized,
    sentenceRepsState,
    numberOfSentencesPendingOrDueState,
    setSentenceRepsState,
    numberOfSnippets,
  } = useLearningScreen();
  const sentencesNeedReview = contentMetaMemoized[0]?.sentencesNeedReview;

  const handleClearReps = () => {
    setSentenceRepsState(0);
  };

  return (
    <div>
      <p className='text-xs font-medium m-auto w-fit'>
        Sentences: {sentencesNeedReview}/{numberOfSentencesPendingOrDueState}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Words Due: {contentMetaWordMemoized[0].length}
      </p>
      <p className='text-xs font-medium m-auto w-fit'>
        Snippets: {numberOfSnippets.length}
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
