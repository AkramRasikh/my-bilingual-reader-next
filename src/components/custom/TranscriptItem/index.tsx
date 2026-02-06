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
import { arabic } from '@/app/languages';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    thisSnippetOverlapMemoized,
    isLoadingState,
    contentItem,
    handleSaveFunc,
    highlightedTextsArabicTransliteration,
    thisHasSavedSnippetOverlap,
    handleDeleteSnippet,
    handleLoopHere,
    biggestOverlappedSnippet,
    overlappingTextMemoized,
    snippetLoadingState,
    languageSelectedState,
  } = useTranscriptItem();

  const thisIsOverlapping = biggestOverlappedSnippet === contentItem.id;
  const isArabic = languageSelectedState === arabic;

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
          isArabic={isArabic}
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
          {!thisIsOverlapping && <TranscriptItemMenuSection />}
        </div>
      </div>
      <TranscriptItemReviewSection />
      {highlightedTextState && (
        <HighlightedText
          isLoadingState={isLoadingState}
          handleSaveFunc={handleSaveFunc}
          highlightedTextState={highlightedTextState}
        />
      )}
      {thisHasSavedSnippetOverlap && thisHasSavedSnippetOverlap.length > 0 && (
        <TranscriptItemTimeOverlappingIndicatorMulti
          contentItemId={contentItem.id}
          thisHasSavedSnippetOverlap={thisHasSavedSnippetOverlap}
          handleDeleteSnippet={handleDeleteSnippet}
          handleLoopHere={handleLoopHere}
          snippetLoadingState={snippetLoadingState}
        />
      )}
    </TranscriptItemWrapper>
  );
};

export default TranscriptItem;
