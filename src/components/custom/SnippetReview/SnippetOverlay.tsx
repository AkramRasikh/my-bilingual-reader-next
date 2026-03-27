import SnippetReview from '.';
import { ComponentProps } from 'react';
import FormattedSentenceSnippet from './SnippetReviewContent';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';
import SnippetReviewBreakdownDefinitions from './SnippetReviewBreakdownDefinitions';
import getColorByIndex from '@/utils/get-color-by-index';
import { useSnippetReviewController } from './useSnippetReviewController';

type SnippetOverlayProps = ComponentProps<typeof SnippetReview>;
type SnippetOverlayWithSpacingProps = SnippetOverlayProps & {
  maxTopSpacingPx?: number;
};

const SnippetOverlay = (props: SnippetOverlayWithSpacingProps) => {
  const {
    snippetData,
    handleLoopHere,
    isVideoPlaying,
    threeSecondLoopState,
    handleUpdateSnippetComprehensiveReview,
    isReadyForQuickReview,
    handleBreakdownSentence,
    isBreakingDownSentenceArrState,
    currentTime,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    sentenceMapMemoized,
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    dummy = false,
    maxTopSpacingPx = 120,
  } = props;

  const {
    selectionContainerRef,
    vocab,
    showTransliteration,
    pinyinStart,
    slicedSnippetSegment,
    targetLangWithVocabStartIndex,
    wordsFromSentence,
    matchStartKey,
    matchEndKey,
    wordPopUpState,
    setWordPopUpState,
    isLoadingSaveSnippetState,
    handleSaveFunc,
  } = useSnippetReviewController({
    snippetData,
    handleLoopHere,
    isVideoPlaying,
    threeSecondLoopState,
    handleUpdateSnippetComprehensiveReview,
    isReadyForQuickReview,
    handleBreakdownSentence,
    isBreakingDownSentenceArrState,
    currentTime,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    sentenceMapMemoized,
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  });

  const dummyTextContainerStyle = dummy
    ? {
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(2px) saturate(0.9)',
        WebkitBackdropFilter: 'blur(2px) saturate(0.9)',
        width: 'fit-content',
        margin: '0 auto',
        borderRadius: 8,
        padding: '1px 5px',
      }
    : {};

  return (
    <div
      className='relative'
      data-testid={`snippet-overlay-item-${snippetData.id}`}
    >
      <div className='absolute left-0 top-0 w-full z-20'>
        <div
          className='absolute left-0 bottom-full mb-2 w-full text-center overflow-y-auto leading-tight'
          style={{ maxHeight: maxTopSpacingPx }}
        >
          <div className='mb-0'>
            <SnippetReviewBreakdownDefinitions
              slicedSnippetSegment={slicedSnippetSegment}
              getColorByIndex={getColorByIndex}
              matchStartKey={matchStartKey}
              matchEndKey={matchEndKey}
              pinyinStart={pinyinStart}
              vocab={vocab}
            />
          </div>
          {showTransliteration && (
            <div className='-mt-0.5'>
              <SnippetReviewPinyinHelper
                slicedSnippetSegment={slicedSnippetSegment}
                getColorByIndex={getColorByIndex}
                matchStartKey={matchStartKey}
                matchEndKey={matchEndKey}
                pinyinStart={pinyinStart}
                languageSelectedState={languageSelectedState}
                isReadyForQuickReview={isReadyForQuickReview}
                currentTime={currentTime}
                dummy={dummy}
              />
            </div>
          )}
        </div>

        <div className='w-full text-center'>
          <div style={dummyTextContainerStyle}>
            <div className='flex text-align-justify'>
              <FormattedSentenceSnippet
                ref={selectionContainerRef}
                targetLangformatted={targetLangWithVocabStartIndex}
                wordPopUpState={wordPopUpState}
                setWordPopUpState={setWordPopUpState}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                wordsFromSentence={wordsFromSentence}
                languageSelectedState={languageSelectedState}
                matchStartKey={matchStartKey}
                matchEndKey={matchEndKey}
                handleSaveFunc={handleSaveFunc}
                currentTime={currentTime}
                isReadyForQuickReview={isReadyForQuickReview}
                dummy={dummy}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetOverlay;
