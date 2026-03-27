import SnippetReview from '.';
import { ComponentProps } from 'react';
import FormattedSentenceSnippet from './SnippetReviewContent';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';
import SnippetReviewBreakdownDefinitions from './SnippetReviewBreakdownDefinitions';
import getColorByIndex from '@/utils/get-color-by-index';
import clsx from 'clsx';
import { useSnippetReviewController } from './useSnippetReviewController';

type SnippetOverlayProps = ComponentProps<typeof SnippetReview>;

const SnippetOverlay = (props: SnippetOverlayProps) => {
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

  return (
    <div
      className='relative'
      data-testid={`snippet-overlay-item-${snippetData.id}`}
    >
      <div className={clsx('rounded', !dummy && 'border py-2 px-1')}>
        <div className={clsx('flex gap-3', dummy && 'flex-col')}>
          <div className='flex-1'>
            <div className='flex mb-2 gap-1'>
              <div className='w-full text-center'>
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
                {showTransliteration && (
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
                )}

                <SnippetReviewBreakdownDefinitions
                  slicedSnippetSegment={slicedSnippetSegment}
                  getColorByIndex={getColorByIndex}
                  matchStartKey={matchStartKey}
                  matchEndKey={matchEndKey}
                  pinyinStart={pinyinStart}
                  vocab={vocab}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetOverlay;
