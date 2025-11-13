import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';
import WordCard from '@/components/custom/WordCard';

const LearningScreenTabTranscript = () => {
  const {
    threeSecondLoopState,
    overlappingSnippetDataState,
    setSentenceHighlightingState,
    sentenceHighlightingState,
    breakdownSentencesArrState,
    masterPlay,
    isGenericItemLoadingState,
    isBreakingDownSentenceArrState,
    isInReviewMode,
    onlyShowEngState,
    setLoopTranscriptState,
    loopTranscriptState,
    handleReviewFunc,
    isVideoPlaying,
    handlePause,
    handleFromHere,
    handleBreakdownSentence,
    setBreakdownSentencesArrState,
    latestDueIdState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
    playFromThisContext,
    learnFormattedTranscript,
    groupedByContextBySentence,
    sentencesForReviewMemoized,
    reviewWordsAlongWithSentencesState,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    updateWordDataProvider,
    addWordToBasket,
    isInBasket,
    addImageDataProvider,
  } = useFetchData();
  const hasSentencesAndWordsInTandem = sentencesForReviewMemoized?.length > 0;

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <TabsContent
      value='transcript'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      {hasSentencesAndWordsInTandem && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={sentencesForReviewMemoized}
        />
      )}
      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {learnFormattedTranscript.map((contentItem, index) => {
          const isInReviewModeAndHasSentences =
            isInReviewMode &&
            reviewWordsAlongWithSentencesState &&
            groupedByContextBySentence?.[contentItem.id]?.length > 0;

          return (
            <div key={index}>
              {isInReviewModeAndHasSentences && (
                <div className='flex flex-col gap-1 mb-1'>
                  {groupedByContextBySentence[contentItem.id].map(
                    (thisWordItem, nestedIndex) => {
                      return (
                        <li key={thisWordItem.id} className='mx-auto'>
                          <WordCard
                            {...thisWordItem}
                            indexNum={nestedIndex + 1}
                            updateWordData={updateWordDataProvider}
                            addWordToBasket={addWordToBasket}
                            isInBasket={isInBasket}
                            addImageDataProvider={addImageDataProvider}
                            playFromThisContext={() =>
                              playFromThisContext(contentItem.id)
                            }
                            languageSelectedState={languageSelectedState}
                            wordContextIsPlaying={
                              isVideoPlaying && masterPlay === contentItem.id
                            }
                            handlePause={handlePause}
                          />
                        </li>
                      );
                    },
                  )}
                </div>
              )}
              <TranscriptItemProvider
                indexNum={index}
                threeSecondLoopState={threeSecondLoopState}
                overlappingSnippetDataState={overlappingSnippetDataState}
                setSentenceHighlightingState={setSentenceHighlightingState}
                sentenceHighlightingState={sentenceHighlightingState}
                contentItem={contentItem}
                breakdownSentencesArrState={breakdownSentencesArrState}
                masterPlay={masterPlay}
                isGenericItemLoadingState={isGenericItemLoadingState}
                handleSaveWord={handleSaveWord}
                handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                wordsState={wordsState}
                isInReviewMode={isInReviewMode}
                onlyShowEngState={onlyShowEngState}
                setLoopTranscriptState={setLoopTranscriptState}
                loopTranscriptState={loopTranscriptState}
                handleReviewFunc={handleReviewFunc}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleFromHere={handleFromHere}
                handleBreakdownSentence={handleBreakdownSentence}
                setBreakdownSentencesArrState={setBreakdownSentencesArrState}
                isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
                latestDueIdState={latestDueIdState}
                scrollToElState={scrollToElState}
                wordsForSelectedTopic={wordsForSelectedTopic}
                languageSelectedState={languageSelectedState}
              >
                <TranscriptItem />
              </TranscriptItemProvider>
            </div>
          );
        })}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabTranscript;
