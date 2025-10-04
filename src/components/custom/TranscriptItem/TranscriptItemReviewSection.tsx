import { getTimeDiffSRS } from '@/app/srs-utils/get-time-diff-srs';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import useTranscriptItem from './useTranscriptItem';

const TranscriptItemReviewSection = () => {
  const { contentItem, isInReviewMode, handleReviewFunc } = useTranscriptItem();

  const hasBeenReviewed = contentItem?.reviewData?.due;
  const timeNow = new Date();
  const isDueNow = new Date(hasBeenReviewed) < timeNow;

  return (
    <>
      {isInReviewMode && isDueNow ? (
        <ReviewSRSToggles
          contentItem={contentItem}
          handleReviewFunc={handleReviewFunc}
          isVocab={false}
        />
      ) : isInReviewMode && hasBeenReviewed ? (
        <p className='italic m-1 text-center'>
          Due in{' '}
          {getTimeDiffSRS({ dueTimeStamp: new Date(hasBeenReviewed), timeNow })}
        </p>
      ) : null}
    </>
  );
};

export default TranscriptItemReviewSection;
