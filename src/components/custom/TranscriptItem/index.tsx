import HighlightedText from '@/components/custom/HighlightedText';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemWrapper from './TranscriptItemWrapper';
import TranscriptItemTimeOverlappingIndicator from './TranscriptItemTimeOverlappingIndicator';
import TranscriptItemMenuSection from './TranscriptItemMenuSection';
import TranscriptItemReviewSection from './TranscriptItemReviewSection';
import TranscriptItemActionBar from './TranscriptItemActionBar';
import TranscriptItemContent from './TranscriptItemContent';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    setHighlightedTextState,
    thisSnippetOverlapState,
    isLoadingState,
    contentItem,
    handleSaveFunc,
  } = useTranscriptItem();

  return (
    <TranscriptItemWrapper>
      {thisSnippetOverlapState && (
        <TranscriptItemTimeOverlappingIndicator
          thisSnippetOverlapState={thisSnippetOverlapState}
        />
      )}
      <div className='flex gap-1'>
        <TranscriptItemActionBar />
        <div className='flex w-full gap-1 justify-between'>
          <TranscriptItemContent />
          <TranscriptItemMenuSection />
        </div>
      </div>
      <TranscriptItemReviewSection />
      {highlightedTextState && (
        <HighlightedText
          isLoadingState={isLoadingState}
          handleSaveFunc={handleSaveFunc}
          setHighlightedTextState={setHighlightedTextState}
          highlightedTextState={highlightedTextState}
        />
      )}
      {contentItem?.title && (
        <p className='flex justify-end opacity-50'>{contentItem.title}</p>
      )}
    </TranscriptItemWrapper>
  );
};

export default TranscriptItem;
