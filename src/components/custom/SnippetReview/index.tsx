import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import SnippetReviewChineseAudioControls from './SnippetReviewAudioControls';
import FormattedSentenceSnippet from '@/components/custom/SnippetReview/SnippetReviewContent';
import HighlightedText from '@/components/custom/HighlightedText';
import {
  ContentTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import getColorByIndex from '@/utils/get-color-by-index';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';
import SnippetReviewBoundaryToggles from './SnippetReviewBoundaryToggles';
import { LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import {
  HandleDeleteWordDataProviderCallTypes,
  HandleSaveWordCallTypes,
} from '@/app/Providers/FetchDataProvider';
import SnippetReviewBreakdownDefinitions from './SnippetReviewBreakdownDefinitions';
import clsx from 'clsx';
import { useSnippetReviewController } from './useSnippetReviewController';

interface SnippetReviewProps {
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
  handleLoopHere: (arg: { time: number; isContracted?: boolean }) => void;
  isVideoPlaying: boolean;
  threeSecondLoopState: number | null;
  handleUpdateSnippetComprehensiveReview: (arg: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
  }) => Promise<void>;
  isReadyForQuickReview: boolean;
  handleBreakdownSentence: (arg: { sentenceId: string }) => Promise<void>;
  isBreakingDownSentenceArrState?: string[];
  currentTime?: number;
  getSentenceDataOfOverlappingWordsDuringSave: (
    time: number,
    highlightedText: string,
  ) => string | null;
  selectedContentTitleState: string;
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  languageSelectedState: LanguageEnum;
  wordsState: WordTypes[];
  handleSaveWord: (params: HandleSaveWordCallTypes) => void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
  dummy?: boolean;
}

const SnippetReview = ({
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
}: SnippetReviewProps) => {
  const {
    selectionContainerRef,
    thisIsPlaying,
    isPreSnippet,
    vocab,
    showTransliteration,
    pinyinStart,
    slicedSnippetSegment,
    targetLangWithVocabStartIndex,
    sentencesToBreakdown,
    wordsFromSentence,
    matchStartKey,
    matchEndKey,
    indexHasChanged,
    wordPopUpState,
    setWordPopUpState,
    highlightedTextState,
    isLoadingWordState,
    isLoadingSaveSnippetState,
    handlePlaySnippet,
    handleSaveFunc,
    onMoveLeft,
    onMoveRight,
    onExpandLength,
    onContractLength,
    onReset,
    onUpdateSnippet,
    handleReviewSnippetsFinal,
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
      data-testid={`snippet-review-item-${snippetData.id}`}
    >
      {isLoadingSaveSnippetState && (
        <div className='absolute right-1/2 top-3/10'>
          <LoadingSpinner />
        </div>
      )}
      <div className={clsx('rounded', !dummy && 'border py-2 px-1')}>
        <div className={clsx('flex gap-3', dummy && 'flex-col')}>
          <div className='flex-1'>
            <div className='flex mb-2 gap-1'>
              {!dummy ? (
                <SnippetReviewChineseAudioControls
                  thisIsPlaying={thisIsPlaying}
                  handlePlaySnippet={handlePlaySnippet}
                  isPreSnippet={snippetData?.isPreSnippet}
                  sentencesToBreakdown={sentencesToBreakdown}
                  isBreakingDownSentenceArrState={
                    isBreakingDownSentenceArrState
                  }
                  handleBreakdownSentence={handleBreakdownSentence}
                />
              ) : null}
              <div
                className='w-full text-center'
              >
                <div
                  className='flex text-align-justify'
                >
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
                {highlightedTextState && (
                  <HighlightedText
                    isLoadingState={
                      isLoadingWordState || isLoadingSaveSnippetState
                    }
                    handleSaveFunc={handleSaveFunc}
                    highlightedTextState={highlightedTextState}
                  />
                )}
              </div>
            </div>
          </div>
          {!dummy && isPreSnippet && (
            <div>
              <SnippetReviewBoundaryToggles
                isLoading={isLoadingSaveSnippetState}
                indexHasChanged={indexHasChanged}
                onMoveLeft={onMoveLeft}
                onReset={onReset}
                onMoveRight={onMoveRight}
                onContractLength={onContractLength}
                onExpandLength={onExpandLength}
                onUpdateSnippet={onUpdateSnippet}
              />
            </div>
          )}
        </div>
        {!dummy ? (
          <ReviewSRSToggles
            isSnippet
            isVocab={false}
            contentItem={snippetData}
            handleReviewFunc={handleReviewSnippetsFinal}
            isReadyForQuickReview={isReadyForQuickReview}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SnippetReview;
