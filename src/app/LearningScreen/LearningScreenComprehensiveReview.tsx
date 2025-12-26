import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import useLearningScreen from './useLearningScreen';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import LearningScreenTabTranscriptNestedWordsReview from './TabContent/LearningScreenTabTranscriptNestedWordsReview';
import LearningScreenSnippetReview from './experimental/LearningScreenSnippetReview';
import ReviewTypeToggles from './components/ReviewTypeToggles';
import { isWithinInterval } from './LearningScreenProvider';

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

const LearningScreenComprehensiveReview = () => {
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
    transcriptRef,
    scrollToElState,
    wordsForSelectedTopic,
    formattedTranscriptState,
    handleDeleteSnippet,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handlePlayFromHere,
    handleUpdateSnippetReview,
    savedSnippetsMemoized,
    enableWordReviewState,
    setEnableWordReviewState,
    enableTranscriptReviewState,
    setEnableTranscriptReviewState,
    enableSnippetReviewState,
    setEnableSnippetReviewState,
    reviewIntervalState,
    setReviewIntervalState,
    firstTime,
    contentMetaWordMemoized,
    snippetsWithDueStatusMemoized,
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
  const [firstTimeState, setFirstTimeState] = useState(null);

  useEffect(() => {
    if (
      postSentencesState.length === 0 &&
      postWordsState.length === 0 &&
      postSnippetsState.length === 0
    ) {
      setFirstTimeState(firstTime);
    } else if (firstTime !== null && firstTime < firstTimeState) {
      setFirstTimeState(firstTime);
    }
  }, [
    postSentencesState,
    postWordsState,
    postSnippetsState,
    firstTime,
    firstTimeState,
  ]);

  useEffect(() => {
    if (!enableWordReviewState) {
      setPostWordsState([]);
    } else if (firstTimeState !== null) {
      setPostWordsState(
        contentMetaWordMemoized.filter((item) =>
          isWithinInterval(item, firstTimeState, reviewIntervalState),
        ),
      );
    }
  }, [
    enableWordReviewState,
    firstTimeState,
    reviewIntervalState,
    contentMetaWordMemoized,
  ]);

  const slicedTranscriptArray = useMemo(() => {
    const indexFirstTime = formattedTranscriptState.findIndex(
      (item) => item.time >= firstTimeState,
    );
    const indexLastTime = formattedTranscriptState.findIndex(
      (item) => item.time >= firstTimeState + reviewIntervalState,
    );

    return formattedTranscriptState.slice(indexFirstTime, indexLastTime);
  }, [formattedTranscriptState, firstTimeState, reviewIntervalState]);

  const transcriptDueNumber = useMemo(() => {
    return slicedTranscriptArray.filter((item) => item.isDue);
  }, [slicedTranscriptArray]);

  useEffect(() => {
    if (!enableTranscriptReviewState) {
      setPostSentencesState([]);
    } else if (firstTimeState !== null) {
      setPostSentencesState(transcriptDueNumber);
    }
  }, [
    enableTranscriptReviewState,
    firstTimeState,
    reviewIntervalState,
    formattedTranscriptState,
    transcriptDueNumber,
  ]);

  useEffect(() => {
    if (!enableSnippetReviewState) {
      setPostSnippetsState([]);
    } else if (firstTimeState !== null) {
      setPostSnippetsState(
        snippetsWithDueStatusMemoized.filter((item) =>
          isWithinInterval(item, firstTimeState, reviewIntervalState),
        ) || [],
      );
    }
  }, [
    enableSnippetReviewState,
    firstTimeState,
    reviewIntervalState,
    snippetsWithDueStatusMemoized,
  ]);

  const handleLoopHere = ({ time, isContracted }) => {
    const playFromTime = time - (isContracted ? 0.75 : 1.5);
    setThreeSecondLoopState(time);
    setContractThreeSecondLoopState(isContracted);
    handlePlayFromHere(playFromTime);
  };

  const handleReviewSnippets = async (args) => {
    const isRemoveReview = args?.isRemoveReview;
    if (isRemoveReview) {
      await finalDeleteSnippet(args.id, args?.wordsFromSentence);
      return;
    }
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState();
    await handleUpdateSnippetReview(args);
  };

  const finalDeleteSnippet = async (snippetId, wordsFromSentence) => {
    await handleDeleteSnippet(snippetId, wordsFromSentence);
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState();
  };

  if (
    postWordsState?.length === 0 &&
    postSentencesState?.length === 0 &&
    postSnippetsState?.length === 0
  ) {
    return (
      <div>
        <ReviewTypeToggles
          enableWordReviewState={enableWordReviewState}
          setEnableWordReviewState={setEnableWordReviewState}
          enableTranscriptReviewState={enableTranscriptReviewState}
          setEnableTranscriptReviewState={setEnableTranscriptReviewState}
          enableSnippetReviewState={enableSnippetReviewState}
          setEnableSnippetReviewState={setEnableSnippetReviewState}
          wordsCount={postWordsState?.length || 0}
          sentencesCount={postSentencesState.length || 0}
          snippetsCount={postSnippetsState?.length}
          reviewIntervalState={reviewIntervalState}
          setReviewIntervalState={setReviewIntervalState}
        />
        <h2 className='text-center'>Done!</h2>
      </div>
    );
  }

  return (
    <>
      <ReviewTypeToggles
        enableWordReviewState={enableWordReviewState}
        setEnableWordReviewState={setEnableWordReviewState}
        enableTranscriptReviewState={enableTranscriptReviewState}
        setEnableTranscriptReviewState={setEnableTranscriptReviewState}
        enableSnippetReviewState={enableSnippetReviewState}
        setEnableSnippetReviewState={setEnableSnippetReviewState}
        wordsCount={postWordsState?.length || 0}
        sentencesCount={postSentencesState.length || 0}
        snippetsCount={postSnippetsState?.length}
        reviewIntervalState={reviewIntervalState}
        setReviewIntervalState={setReviewIntervalState}
      />
      {postSnippetsState?.length > 0 ? (
        <div className='flex flex-col gap-2 mb-2'>
          {postSnippetsState.map((item, index) => {
            return (
              <LearningScreenSnippetReview
                key={index}
                item={item}
                handleLoopHere={handleLoopHere}
                isVideoPlaying={isVideoPlaying}
                threeSecondLoopState={threeSecondLoopState}
                highlightFocusedText={highlightFocusedText}
                handleReviewSnippets={handleReviewSnippets}
              />
            );
          })}
        </div>
      ) : null}
      {postWordsState?.length > 0 && (
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
        {slicedTranscriptArray?.map((contentItem, index) => {
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
              scrollToElState={scrollToElState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              languageSelectedState={languageSelectedState}
              savedSnippetsMemoized={savedSnippetsMemoized}
              isComprehensiveMode={true}
              setThreeSecondLoopState={setThreeSecondLoopState}
              setContractThreeSecondLoopState={setContractThreeSecondLoopState}
            >
              <TranscriptItem />
            </TranscriptItemProvider>
          );
        })}
      </ul>
    </>
  );
};

export default LearningScreenComprehensiveReview;
