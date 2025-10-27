import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { useState } from 'react';

const WordStudyUITranscriptItem = ({
  masterPlay,
  transcriptItem,
  overlappingSnippetDataState,
  handleSaveWord,
  handleDeleteWordDataProvider,
  wordsState,
  isVideoPlaying,
  handlePause,
  handleAudio,
}) => {
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );
  return (
    <TranscriptItemProvider
      threeSecondLoopState={[]}
      overlappingSnippetDataState={overlappingSnippetDataState}
      setSentenceHighlightingState={() => {}}
      sentenceHighlightingState={''}
      contentItem={transcriptItem}
      isPressDownShiftState={false}
      breakdownSentencesArrState={breakdownSentencesArrState}
      masterPlay={masterPlay}
      isGenericItemLoadingState={[]}
      handleSaveWord={handleSaveWord}
      handleDeleteWordDataProvider={handleDeleteWordDataProvider}
      wordsState={wordsState}
      isInReviewMode={false}
      onlyShowEngState={false}
      setLoopTranscriptState={() => {}}
      loopTranscriptState={[]}
      handleReviewFunc={() => {}}
      isVideoPlaying={isVideoPlaying}
      handlePause={handlePause}
      handleFromHere={() => handleAudio(transcriptItem.id, transcriptItem.time)}
      handleBreakdownSentence={() => {}}
      setBreakdownSentencesArrState={setBreakdownSentencesArrState}
      isBreakingDownSentenceArrState={[]}
      latestDueIdState={false}
      scrollToElState={''}
      wordsForSelectedTopic={[]}
      isWordStudyMode={true}
    >
      <TranscriptItem />
    </TranscriptItemProvider>
  );
};

export default WordStudyUITranscriptItem;
