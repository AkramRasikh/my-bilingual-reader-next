import { useEffect, useRef, useState } from 'react';
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
    wordsWithinInterval,
    transcriptsWithinInterval,
    transcriptSentenceIdsDue,
    transcriptWordsIdsDue,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const [postSentencesState, setPostSentencesState] = useState([]);
  const [postWordsState, setPostWordsState] = useState([]);

  const transcriptWordsIdsDueRef = useRef(transcriptWordsIdsDue.length);
  const transcriptSentenceIdsDueRef = useRef(transcriptSentenceIdsDue.length);

  useEffect(() => {
    if (postSentencesState.length === 0 && postWordsState.length === 0) {
      setPostSentencesState(
        transcriptsWithinInterval.filter((item) =>
          transcriptSentenceIdsDue.includes(item.id),
        ),
      );
      setPostWordsState(wordsWithinInterval);
    }
  }, [
    transcriptsWithinInterval,
    wordsWithinInterval,
    postSentencesState,
    postWordsState,
  ]);

  useEffect(() => {
    if (
      postSentencesState?.length > 0 &&
      transcriptSentenceIdsDueRef.current !== transcriptSentenceIdsDue.length
    ) {
      const updatedSentences = postSentencesState.filter((item) =>
        transcriptSentenceIdsDue.includes(item.id),
      );
      setPostSentencesState(updatedSentences);
      transcriptSentenceIdsDueRef.current = transcriptSentenceIdsDue.length;
    }
  }, [postSentencesState, transcriptSentenceIdsDue]);

  useEffect(() => {
    if (
      postWordsState?.length > 0 &&
      transcriptWordsIdsDueRef.current !== transcriptWordsIdsDue.length
    ) {
      const updatedWords = postWordsState.filter((item) =>
        transcriptWordsIdsDue.includes(item.id),
      );
      setPostWordsState(updatedWords);
      transcriptWordsIdsDueRef.current = transcriptWordsIdsDue.length;
    }
  }, [postWordsState, transcriptWordsIdsDue]);

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';
  return (
    <TabsContent
      value='comprehensive'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      <h1 className='text-center font-medium mx-auto'>
        words: {postWordsState.length} / sentences: {postSentencesState.length}
      </h1>
      {postWordsState.length > 0 && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={postWordsState}
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
        {postSentencesState?.map((contentItem, index) => {
          return (
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
              isComprehensiveMode={true}
            >
              <TranscriptItem />
            </TranscriptItemProvider>
          );
        })}
      </ul>
    </TabsContent>
  );
};

export default LearningScreenTabJointTranscriptWords;
