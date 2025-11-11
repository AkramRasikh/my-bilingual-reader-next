import { useMemo } from 'react';
import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';

const LearningScreenTabJointTranscriptWords = () => {
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
    learnFormattedTranscript,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const slicedByMinuteIntervalsMemoized = useMemo(() => {
    // Combine potential candidates from both arrays, normalized to a common structure
    const dueCandidates = [
      ...wordsForSelectedTopic
        .filter((item) => item.isDue)
        .map((item) => ({ time: item.time, source: 'words' })),
      ...learnFormattedTranscript
        .filter((item) => item.dueStatus === 'now')
        .map((item) => ({ time: item.time, source: 'transcript' })),
    ];

    // Find the earliest .time across both
    const firstDue = dueCandidates.length
      ? dueCandidates.reduce((earliest, curr) =>
          curr.time < earliest.time ? curr : earliest,
        )
      : null;

    let firstTime = firstDue ? firstDue.time : null;

    if (firstTime === null) {
      console.log('No items due now found in either array.');
    } else {
      const interval = 60; // seconds

      // Filter each array separately within that 60s window
      const sentencesWithinInterval = wordsForSelectedTopic.filter(
        (item) =>
          item?.isDue &&
          item.time >= firstTime &&
          item.time <= firstTime + interval,
      );

      const transcriptsWithinInterval = learnFormattedTranscript.filter(
        (item) => item.time >= firstTime && item.time <= firstTime + interval,
      );

      return {
        sentencesWithinInterval,
        transcriptsWithinInterval,
      };
    }
  }, [wordsForSelectedTopic, learnFormattedTranscript]);

  const wordsInInterval =
    slicedByMinuteIntervalsMemoized?.sentencesWithinInterval;

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <TabsContent
      value='comprehensive'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      {wordsInInterval.length > 0 && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={wordsInInterval}
          withToggle={false}
        />
      )}
      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {slicedByMinuteIntervalsMemoized.transcriptsWithinInterval.map(
          (contentItem, index) => {
            return (
              <div key={index}>
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
                  isBreakingDownSentenceArrState={
                    isBreakingDownSentenceArrState
                  }
                  latestDueIdState={latestDueIdState}
                  scrollToElState={scrollToElState}
                  wordsForSelectedTopic={wordsForSelectedTopic}
                  languageSelectedState={languageSelectedState}
                >
                  <TranscriptItem />
                </TranscriptItemProvider>
              </div>
            );
          },
        )}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabJointTranscriptWords;
