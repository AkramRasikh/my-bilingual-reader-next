import { useEffect, useMemo, useState } from 'react';
import WordCard from '@/components/custom/WordCard';
import { findSentenceWindow } from '@/app/LearningScreen/sentence-window';
import useLearningScreen from '../useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import { findSentenceSnippetForWord } from '../sentence-snippets/sentence-snippet-utils';

const LearningScreenWordCard = ({ word, indexNum, isReadyForQuickReview }) => {
  const [collapseState, setCollapseState] = useState(false);
  const [triggerHideState, setTriggerHideState] = useState(false);
  const {
    playFromThisContext,
    isVideoPlaying,
    handlePause,
    masterPlay,
    contentSnippets,
    sentenceSnippetRecords,
    sentenceSnippets,
    handlePlayFromHere,
    getSentenceFromContextId,
    updateWordDataProvider,
    formattedTranscriptState,
  } = useLearningScreen();
  const {
    languageSelectedState,
    addImageDataProvider,
    adhocSentenceCustomWord,
  } = useFetchData();

  const wordHasOverlappingSnippetTime = useMemo(() => {
    // Preference non-preSnippets first
    const matchesWord = (item) =>
      item?.focusedText?.includes(word.surfaceForm) ||
      item?.focusedText?.includes(word.baseForm) ||
      item?.suggestedFocusText?.includes(word.surfaceForm) ||
      item?.suggestedFocusText?.includes(word.baseForm);

    // Try to find a non-preSnippet first
    let overlappedWord = contentSnippets.find(
      (item) => matchesWord(item) && !item?.isPreSnippet,
    );

    // Fall back to any matching snippet (including preSnippets)
    if (!overlappedWord) {
      overlappedWord = contentSnippets.find(matchesWord);
    }

    if (overlappedWord) {
      const time = overlappedWord.time;
      return overlappedWord?.isContract ? time - 0.75 : time - 1.5;
    }
  }, [word, contentSnippets]);

  // A sentence snippet whose human-set focus contains this word wins over the
  // 3 s snippet match: B loops its exact start..end.
  const wordSentenceSnippet = useMemo(
    () => findSentenceSnippetForWord(word, sentenceSnippetRecords),
    [word, sentenceSnippetRecords],
  );

  const contextId = word?.contexts?.[0];
  const contextSentences = useMemo(() => {
    const sentenceWindow = findSentenceWindow(contextId, [
      { content: formattedTranscriptState ?? [] },
    ]);
    if (!sentenceWindow.current) return undefined;
    return sentenceWindow;
  }, [contextId, formattedTranscriptState]);

  useEffect(() => {
    let timeoutId;

    if (collapseState) {
      timeoutId = setTimeout(() => setTriggerHideState(true), 300);
    }

    return () => {
      // Cleanup — clear any pending timeout
      clearTimeout(timeoutId);
    };
  }, [collapseState]);

  const handleUpdateWord = async (arg) => {
    const isWordData = arg?.isWordData;
    try {
      if (!isWordData) {
        setCollapseState(true);
      }
      const wordResBool = await updateWordDataProvider(arg);
      return wordResBool;
    } finally {
      if (!isWordData) {
        setCollapseState(false);
      }
    }
  };

  const handlePlayFromContextFinal = (args) => {
    if (wordSentenceSnippet) {
      sentenceSnippets.loopWordSnippet(word.id, {
        start: wordSentenceSnippet.start,
        end: wordSentenceSnippet.end,
        snippetId: wordSentenceSnippet.id,
      });
      return;
    }
    if (wordHasOverlappingSnippetTime) {
      handlePlayFromHere(wordHasOverlappingSnippetTime);
      return;
    }

    playFromThisContext(args);
  };

  const wordContextIsPlaying =
    isVideoPlaying && word?.contexts?.[0] === masterPlay;

  return (
    <li className='mx-auto w-full min-w-0 max-w-full'>
      {collapseState && (
        <div className='relative w-full p-3'>
          <div className='absolute left-5/10 top-1/3'>
            <LoadingSpinner />
          </div>
        </div>
      )}
      <div
        className={clsx(
          'transition-all duration-300 overflow-hidden',
          collapseState
            ? 'max-h-0 opacity-0 py-0 my-0'
            : 'max-h-[700px] opacity-100 py-1',
          triggerHideState ? 'hidden' : '',
        )}
      >
        <WordCard
          {...word}
          indexNum={indexNum}
          updateWordData={handleUpdateWord}
          addImageDataProvider={addImageDataProvider}
          playFromThisContext={handlePlayFromContextFinal}
          languageSelectedState={languageSelectedState}
          wordContextIsPlaying={wordContextIsPlaying}
          handlePause={handlePause}
          wordHasOverlappingSnippetTime={
            wordSentenceSnippet?.start ?? wordHasOverlappingSnippetTime
          }
          isReadyForQuickReview={isReadyForQuickReview}
          adhocSentenceCustomWord={adhocSentenceCustomWord}
          getSentenceFromContextId={getSentenceFromContextId}
          contextSentences={contextSentences}
        />
      </div>
    </li>
  );
};

export default LearningScreenWordCard;
