import clsx from 'clsx';
import useTranscriptItem from './useTranscriptItem';

const TranscriptItemWrapper = ({ children }) => {
  const {
    setShowThisSentenceBreakdownPreviewState,
    setWordPopUpState,
    contentItem,
    handleOnMouseEnterSentence,
    isInReviewMode,
  } = useTranscriptItem();

  const hasBeenReviewed = contentItem?.reviewData?.due;
  const timeNow = new Date();
  const isDueNow = new Date(hasBeenReviewed) < timeNow;

  return (
    <div
      className={clsx(
        'rounded-lg px-2 py-1 shadow h-fit border-2 ',
        isDueNow
          ? 'border-red-500'
          : hasBeenReviewed
          ? 'border-amber-500'
          : 'border-blue-200',
        !(isDueNow && isInReviewMode) ? 'opacity-25' : 'opacity-100',
      )}
      style={{
        gap: 5,
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
