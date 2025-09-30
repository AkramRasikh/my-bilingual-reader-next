import useLearningScreen from './useLearningScreen';
import { Button } from '@/components/ui/button';

const LearningScreenActionBar = () => {
  const {
    isInReviewMode,
    setLatestDueIdState,
    loopTranscriptState,
    handleBulkReviews,
    handleStudyFromHere,
    studyFromHereTimeState,
    handleScrollToMasterView,
  } = useLearningScreen();

  const isLooping = loopTranscriptState?.length > 0;
  const scrollToLastReviewed = () =>
    setLatestDueIdState((prev) => ({ ...prev, triggerScroll: true }));

  return (
    <div className='flex flex-col items-start gap-2 my-2 p-2'>
      <div className='flex gap-2 mx-auto flex-wrap'>
        <span className='text-sm italic my-auto'>Scroll to: </span>
        <Button variant={'link'} onClick={handleScrollToMasterView}>
          Current
        </Button>
        <Button variant={'link'} onClick={scrollToLastReviewed}>
          Last reviewed
        </Button>
        <Button
          variant={'secondary'}
          disabled={isInReviewMode}
          onClick={handleStudyFromHere}
        >
          Study from here {studyFromHereTimeState}
        </Button>
        {isLooping && !isInReviewMode && (
          <Button variant={'outline'} onClick={handleBulkReviews}>
            Loop ➡️ Review (shft + ⤶)
          </Button>
        )}
      </div>
    </div>
  );
};

export default LearningScreenActionBar;
