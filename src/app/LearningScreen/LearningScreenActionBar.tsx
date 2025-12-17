import { isNumber } from '@/utils/is-number';
import useLearningScreen from './useLearningScreen';
import { Button } from '@/components/ui/button';

const LearningScreenActionBar = () => {
  const {
    isInReviewMode,
    loopTranscriptState,
    handleBulkReviews,
    handleStudyFromHere,
    studyFromHereTimeState,
    masterPlay,
    setStudyFromHereTimeState,
    formattedTranscriptState,
    setScrollToElState,
  } = useLearningScreen();

  const isLooping = loopTranscriptState?.length > 0;

  const handleScrollToMasterView = () => {
    setScrollToElState(masterPlay);
    setTimeout(() => setScrollToElState(''), 300);
  };

  const scrollToLastLeftOff = () => {
    const lastStudiedEls = formattedTranscriptState.filter(
      (el) => el?.reviewData?.due,
    );

    const lastInArr = lastStudiedEls[lastStudiedEls.length - 1]?.id;
    if (lastInArr) {
      setScrollToElState(lastInArr);
      setTimeout(() => setScrollToElState(''), 300);
    }
  };

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
        <Button
          data-testid='current-button'
          variant={'link'}
          onClick={handleScrollToMasterView}
        >
          Current
        </Button>
        {!isInReviewMode && (
          <Button
            data-testid='checkpoint-button'
            variant='link'
            onClick={scrollToLastLeftOff}
          >
            Checkpoint
          </Button>
        )}
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
