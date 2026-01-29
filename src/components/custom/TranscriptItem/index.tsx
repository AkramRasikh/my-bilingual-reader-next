import HighlightedText from '@/components/custom/HighlightedText';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemWrapper from './TranscriptItemWrapper';
import TranscriptItemTimeOverlappingIndicator from './TranscriptItemTimeOverlappingIndicator';
import TranscriptItemMenuSection from './TranscriptItemMenuSection';
import TranscriptItemReviewSection from './TranscriptItemReviewSection';
import TranscriptItemActionBar from './TranscriptItemActionBar';
import TranscriptItemContent from './TranscriptItemContent';
import TranscriptItemLoopingSentence from './TranscriptItemLoopingSentence';
import TranscriptItemTimeOverlappingIndicatorMulti from './TranscriptItemTimeOverlappingIndicatorMulti';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    setHighlightedTextState,
    thisSnippetOverlapMemoized,
    isLoadingState,
    contentItem,
    handleSaveFunc,
    isWordStudyMode,
    highlightedTextsArabicTransliteration,
    isSentenceReviewMode,
    thisHasSavedSnippetOverlap,
    handleDeleteSnippet,
    handleLoopHere,
    biggestOverlappedSnippet,
    overlappingTextMemoized,
  } = useTranscriptItem();

  const thisIsOverlapping = biggestOverlappedSnippet === contentItem.id;

  return (
    <TranscriptItemWrapper>
      {highlightedTextsArabicTransliteration && (
        <p className='-top-6 p-1 absolute left-1/2 -translate-x-1/2 bg-amber-300 rounded whitespace-nowrap'>
          {highlightedTextsArabicTransliteration}
        </p>
      )}
      {thisSnippetOverlapMemoized && (
        <TranscriptItemTimeOverlappingIndicator
          thisSnippetOverlapMemoized={thisSnippetOverlapMemoized}
        />
      )}

      <div className='flex gap-1'>
        <TranscriptItemActionBar />
        <div className='flex w-full gap-1 justify-between'>
          {thisIsOverlapping && overlappingTextMemoized ? (
            <TranscriptItemLoopingSentence
              overlappingTextMemoized={overlappingTextMemoized}
              contentItemId={contentItem.id}
            />
          ) : (
            <TranscriptItemContent />
          )}
          {!thisIsOverlapping && !isWordStudyMode && !isSentenceReviewMode && (
            <TranscriptItemMenuSection />
          )}
        </div>
      </div>
      {!isWordStudyMode && <TranscriptItemReviewSection />}
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
      {thisHasSavedSnippetOverlap?.length > 0 && (
        <TranscriptItemTimeOverlappingIndicatorMulti
          thisHasSavedSnippetOverlap={thisHasSavedSnippetOverlap}
          handleDeleteSnippet={handleDeleteSnippet}
          handleLoopHere={handleLoopHere}
          contentItemId={contentItem?.id}
        />
      )}
    </TranscriptItemWrapper>
  );
};

export default TranscriptItem;
