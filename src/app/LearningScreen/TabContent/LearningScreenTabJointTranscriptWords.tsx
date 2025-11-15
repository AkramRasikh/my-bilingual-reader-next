import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { TabsContent } from '@/components/ui/tabs';
import useLearningScreen from '../useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './LearningScreenTabTranscriptNestedWordsReview';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { Button } from '@/components/ui/button';
import { PlayIcon } from 'lucide-react';

function highlightFocusedText(fullText: string, focusedText: string) {
  if (!focusedText) return fullText;

  const idx = fullText.indexOf(focusedText);
  if (idx === -1) {
    return fullText; // no match
  }

  const before = fullText.slice(0, idx);
  const focus = fullText.slice(idx, idx + focusedText.length);
  const after = fullText.slice(idx + focusedText.length);

  return (
    <>
      {before}
      <strong style={{ background: '#fff176', borderRadius: '4px' }}>
        {focus}
      </strong>
      {after}
    </>
  );
}

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
    snippetsWithinInterval,
    transcriptSnippetsIdsDue,
    formattedTranscriptState,
    handleDeleteSnippet,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    handleUpdateSnippetReview,
  } = useLearningScreen();
  const {
    languageSelectedState,
    wordsState,
    handleSaveWord,
    handleDeleteWordDataProvider,
  } = useFetchData();

  const [postSentencesState, setPostSentencesState] = useState([]);
  const [postWordsState, setPostWordsState] = useState([]);
  const [postSnippetsState, setPostSnippetsState] = useState([]);

  const transcriptWordsIdsDueRef = useRef(transcriptWordsIdsDue.length);
  const transcriptSnippetsIdsDueRef = useRef(transcriptSnippetsIdsDue.length);
  const transcriptSentenceIdsDueRef = useRef(transcriptSentenceIdsDue.length);
  const transcriptSliceRangeRef = useRef(null);

  useEffect(() => {
    if (
      postSentencesState?.length === 0 &&
      postWordsState?.length === 0 &&
      postSnippetsState?.length === 0
    ) {
      const initPostSentences = transcriptsWithinInterval?.filter((item) =>
        transcriptSentenceIdsDue.includes(item.id),
      );
      setPostSentencesState(initPostSentences);
      setPostSnippetsState(snippetsWithinInterval);
      if (transcriptsWithinInterval?.length > 0) {
        transcriptSliceRangeRef.current = [
          transcriptsWithinInterval[0].sentenceIndex,
          transcriptsWithinInterval[transcriptsWithinInterval.length - 1]
            .sentenceIndex,
        ];
      }
      setPostWordsState(wordsWithinInterval);
    }
  }, [
    snippetsWithinInterval,
    transcriptsWithinInterval,
    wordsWithinInterval,
    postSentencesState,
    postWordsState,
    postSnippetsState,
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
      postSnippetsState?.length > 0 &&
      transcriptSnippetsIdsDueRef.current !== transcriptSnippetsIdsDue.length
    ) {
      const updatedSnippets = postSnippetsState.filter((item) =>
        transcriptSnippetsIdsDue.includes(item.id),
      );
      setPostSnippetsState(updatedSnippets);
      transcriptSnippetsIdsDueRef.current = transcriptSnippetsIdsDue.length;
    }
  }, [postSnippetsState, transcriptSnippetsIdsDue]);

  const handleLoopHere = ({ time, isContracted }) => {
    setThreeSecondLoopState(time);
    setContractThreeSecondLoopState(isContracted);
    handlePlayFromHere(time);
  };

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

  const handleReviewSnippets = async (args) => {
    const isRemoveReview = args?.isRemoveReview;
    if (isRemoveReview) {
      await finalDeleteSnippet(args.id);
      return;
    }
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState();
    await handleUpdateSnippetReview(args);
  };

  const finalDeleteSnippet = async (snippetId) => {
    await handleDeleteSnippet(snippetId);
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState();
  };

  const slicedTranscriptArrayMemoized = formattedTranscriptState.slice(
    transcriptSliceRangeRef.current?.[0],
    transcriptSliceRangeRef.current?.[1],
  );

  const contentClasses = 'p-1 max-h-150 overflow-y-auto';

  if (
    postWordsState?.length === 0 &&
    postSentencesState?.length === 0 &&
    postSnippetsState?.length === 0
  ) {
    return (
      <TabsContent
        value='comprehensive'
        className={clsx(contentClasses, 'border rounded-lg')}
      >
        <h2>Done!</h2>
      </TabsContent>
    );
  }

  return (
    <TabsContent
      value='comprehensive'
      className={clsx(contentClasses, 'border rounded-lg')}
    >
      <h1 className='text-center font-medium mx-auto'>
        words: {postWordsState?.length} / sentences:{' '}
        {postSentencesState?.length} / snippets : {postSnippetsState?.length}
      </h1>
      {postWordsState?.length > 0 && (
        <LearningScreenTabTranscriptNestedWordsReview
          sentencesForReviewMemoized={postWordsState}
          withToggle={false}
        />
      )}
      {postSnippetsState?.map((item, index) => (
        <div key={index} className='rounded border text-center py-2 px-1'>
          <div className='flex mb-2 gap-1'>
            <Button
              className='h-7 w-7'
              onClick={() =>
                handleLoopHere({
                  time: item.time,
                  isContracted: item.isContracted,
                })
              }
            >
              <PlayIcon />
            </Button>
            <p>{highlightFocusedText(item?.targetLang, item?.focusedText)}</p>
          </div>
          <ReviewSRSToggles
            isSnippet
            contentItem={item}
            handleReviewFunc={handleReviewSnippets}
          />
        </div>
      ))}
      <ul
        className={clsx(
          'gap-1',
          isInReviewMode ? 'inline-flex flex-wrap' : 'flex flex-col',
        )}
        ref={transcriptRef}
      >
        {slicedTranscriptArrayMemoized?.map((contentItem, index) => {
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
