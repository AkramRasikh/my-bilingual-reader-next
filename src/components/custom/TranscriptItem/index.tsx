import clsx from 'clsx';
import HighlightedTextSection from '@/app/HighlightedTextSection';
import { NewSentenceBreakdown } from '@/app/SentenceBreakdown';
import FormattedSentence from '@/app/FormattedSentence';
import useTranscriptItem from './useTranscriptItem';
import TranscriptItemWrapper from './TranscriptItemWrapper';
import TranscriptItemTimeOverlappingIndicator from './TranscriptItemTimeOverlappingIndicator';
import TranscriptItemMenuSection from './TranscriptItemMenuSection';
import TranscriptItemReviewSection from './TranscriptItemReviewSection';
import TranscriptItemActionBar from './TranscriptItemActionBar';

const TranscriptItem = () => {
  const {
    highlightedTextState,
    setHighlightedTextState,
    showSentenceBreakdownState,
    thisSnippetOverlapState,
    isLoadingState,
    showThisSentenceBreakdownPreviewState,
    wordPopUpState,
    setWordPopUpState,
    ulRef,
    contentItem,
    handleMouseEnter,
    handleMouseLeave,
    masterPlay,
    handleSaveFunc,
    onlyShowEngState,
  } = useTranscriptItem();

  const baseLang = contentItem.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  return (
    <TranscriptItemWrapper>
      {thisSnippetOverlapState && (
        <TranscriptItemTimeOverlappingIndicator
          thisSnippetOverlapState={thisSnippetOverlapState}
        />
      )}
      <div className='flex gap-1'>
        <TranscriptItemActionBar />
        <div className='flex w-full justify-between'>
          <div className={clsx(thisSentenceIsPlaying && 'bg-yellow-200 h-fit')}>
            {(showSentenceBreakdownState && hasSentenceBreakdown) ||
            showThisSentenceBreakdownPreviewState ? (
              <NewSentenceBreakdown
                vocab={contentItem.vocab}
                meaning={contentItem.meaning}
                thisSentencesSavedWords={thisSentencesSavedWords}
                handleSaveFunc={handleSaveFunc}
                sentenceStructure={contentItem.sentenceStructure}
              />
            ) : (
              <>
                <p className='flex gap-2'>
                  <FormattedSentence
                    ref={ulRef}
                    targetLangformatted={targetLangformatted}
                    handleMouseLeave={handleMouseLeave}
                    handleMouseEnter={handleMouseEnter}
                    wordPopUpState={wordPopUpState}
                    setWordPopUpState={setWordPopUpState}
                  />
                </p>
                {!onlyShowEngState && <p>{baseLang}</p>}
              </>
            )}
          </div>

          <TranscriptItemMenuSection />
        </div>
      </div>
      <TranscriptItemReviewSection />
      {highlightedTextState && (
        <HighlightedTextSection
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
