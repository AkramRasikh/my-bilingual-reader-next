import clsx from 'clsx';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemInReviewMiniActionBar from './TranscriptItemInReviewMiniActionBar';
import { AnimationFade, fadeAnimationStyle } from '../AnimationWrapper';

const TranscriptItemWrapper = ({ children }) => {
  const {
    setShowThisSentenceBreakdownPreviewState,
    setWordPopUpState,
    contentItem,
    handleOnMouseEnterSentence,
    isInReviewMode,
    overrideMiniReviewState,
    highlightedTextsArabicTransliteration,
    indexNum,
    transcriptItemContainerRef,
    collapseState,
    isComprehensiveMode,
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

  const isFirstInIndex =
    indexNum === 0 && highlightedTextsArabicTransliteration;

  return (
    <div
      ref={transcriptItemContainerRef}
      className={clsx(
        'rounded-lg px-2 py-1 shadow h-fit border-2 gap-1.5 relative',
        isComprehensiveMode
          ? 'transition-all duration-300 overflow-hidden'
          : '',
        dueStatus === 'now'
          ? 'border-red-500'
          : hasBeenReviewed
          ? 'border-amber-500'
          : 'border-blue-200',
        dueStatus !== 'now' ? 'opacity-50' : 'opacity-100',
        isInReviewMode ? 'w-full' : '',
        isFirstInIndex ? 'mt-5' : '',
        collapseState
          ? 'max-h-0 opacity-0 py-0 my-0'
          : isComprehensiveMode
          ? 'max-h-96 opacity-100 py-1'
          : '',
      )}
      style={{
        animation: !isInReviewMode ? fadeAnimationStyle : '',
      }}
      onMouseEnter={handleOnMouseEnterSentence}
      onMouseLeave={() => {
        setWordPopUpState([]);
        setShowThisSentenceBreakdownPreviewState(false);
      }}
    >
      {children}
      <AnimationFade />
    </div>
  );
};

export default TranscriptItemWrapper;
