import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { useMemo, useState } from 'react';
import { isDueCheck } from '@/utils/is-due-check';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';

const LearningScreenTabTranscript = () => {
  useState(true);
  const {
    formattedTranscriptState,
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
    firstDueIndexMemoized,
    studyFromHereTimeState,
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const learnFormattedTranscript =
    isInReviewMode && latestDueIdState?.id
      ? formattedTranscriptState.slice(
          firstDueIndexMemoized,
          latestDueIdState?.index + 1,
        )
      : studyFromHereTimeState
      ? formattedTranscriptState.slice(studyFromHereTimeState)
      : formattedTranscriptState;

  const sentencesForReviewMemoized = useMemo(() => {
    if (!isInReviewMode || wordsForSelectedTopic?.length === 0) {
      return [];
    }

    const sentenceIdsForReview = [];

    learnFormattedTranscript.forEach((transcriptEl) => {
      if (transcriptEl.dueStatus === 'now') {
        sentenceIdsForReview.push(transcriptEl.id);
      }
    });

    if (sentenceIdsForReview.length === 0) {
      return [];
    }
    const now = new Date();

    return wordsForSelectedTopic.filter((wordItem) => {
      const firstContext = wordItem.contexts[0];
      if (
        sentenceIdsForReview.includes(firstContext) &&
        isDueCheck(wordItem, now)
      ) {
        return true;
      }

      return false;
    });
  }, [learnFormattedTranscript, isInReviewMode, wordsForSelectedTopic]);

  const hasSentencesAndWordsInTandem = sentencesForReviewMemoized.length > 0;

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
        {learnFormattedTranscript.map((contentItem, index) => (
          <TranscriptItemProvider
            key={index}
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
        ))}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabTranscript;
