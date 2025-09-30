import { isNumber } from '@/utils/is-number';
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
    setStudyFromHereTimeState,
  } = useLearningScreen();

  const isLooping = loopTranscriptState?.length > 0;
  const scrollToLastReviewed = () =>
    setLatestDueIdState((prev) => ({ ...prev, triggerScroll: true }));

  const studyFromHereTimeStateNumber = isNumber(studyFromHereTimeState);

  return (
    <div className='flex flex-col items-start gap-2 my-2 p-2'>
      <div className='flex gap-2 flex-wrap'>
        {!isInReviewMode && (
          <>
            <Button onClick={handleStudyFromHere} variant={'outline'}>
              Study here {studyFromHereTimeState}
            </Button>
            {studyFromHereTimeStateNumber && (
              <Button
                variant={'destructive'}
                onClick={() => setStudyFromHereTimeState(null)}
              >
                Clear
              </Button>
            )}
            <div className='w-px h-8 my-auto bg-gray-400' />
          </>
        )}
        <Button variant={'link'} onClick={handleScrollToMasterView}>
          Current
        </Button>
        <Button variant={'link'} onClick={scrollToLastReviewed}>
          Checkpoint
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
