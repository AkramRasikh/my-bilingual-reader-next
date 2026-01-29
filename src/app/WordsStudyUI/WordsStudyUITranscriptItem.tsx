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
  languageSelectedState,
}) => {
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );
  return (
    <TranscriptItemProvider
      threeSecondLoopState={[]}
      overlappingSnippetDataState={overlappingSnippetDataState}
      contentItem={transcriptItem}
      breakdownSentencesArrState={breakdownSentencesArrState}
      masterPlay={masterPlay}
      isGenericItemLoadingState={[]}
      snippetLoadingState={[]}
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
      scrollToElState={''}
      wordsForSelectedTopic={[]}
      isWordStudyMode={true}
      languageSelectedState={languageSelectedState}
    >
      <TranscriptItem />
    </TranscriptItemProvider>
  );
};

export default WordStudyUITranscriptItem;
