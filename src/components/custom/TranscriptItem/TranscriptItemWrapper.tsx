import clsx from 'clsx';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemInReviewMiniActionBar from './TranscriptItemInReviewMiniActionBar';

const TranscriptItemWrapper = ({ children }) => {
  const {
    setShowThisSentenceBreakdownPreviewState,
    setWordPopUpState,
    contentItem,
    handleOnMouseEnterSentence,
    isInReviewMode,
    overrideMiniReviewState,
  } = useTranscriptItem();

  const hasBeenReviewed = contentItem?.reviewData?.due;
  const dueStatus = contentItem?.dueStatus;
  const notDue = dueStatus !== 'now';

  const helperReviewSentence = contentItem?.helperReviewSentence;
  const showMiniReviewWidget =
    isInReviewMode &&
    notDue &&
    !helperReviewSentence &&
    !overrideMiniReviewState;

  if (showMiniReviewWidget) {
    return <TranscriptItemInReviewMiniActionBar />;
  }

  return (
    <div
      className={clsx(
        'rounded-lg px-2 py-1 shadow h-fit border-2 gap-1.5',
        dueStatus === 'now'
          ? 'border-red-500'
          : hasBeenReviewed
          ? 'border-amber-500'
          : 'border-blue-200',
        dueStatus !== 'now' ? 'opacity-50' : 'opacity-100',
        isInReviewMode ? 'w-full' : '',
      )}
      style={{
        animation: !isInReviewMode ? 'fadeIn 0.5s ease-out forwards' : '',
      }}
      onMouseEnter={handleOnMouseEnterSentence}
      onMouseLeave={() => {
        setWordPopUpState([]);
        setShowThisSentenceBreakdownPreviewState(false);
      }}
    >
      {children}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TranscriptItemWrapper;
