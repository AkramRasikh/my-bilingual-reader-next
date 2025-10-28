import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import useData from '../Providers/useData';
import { useFetchData } from '../Providers/FetchDataProvider';

const SentencesUITranscriptItem = ({ sentence, sentenceIndex }) => {
  const { wordsState } = useData();
  const { languageSelectedState } = useFetchData();
  return (
    <TranscriptItemProvider
      contentItem={sentence}
      indexNum={sentenceIndex}
      languageSelectedState={languageSelectedState}
      breakdownSentencesArrState={[]}
      isBreakingDownSentenceArrState={[]}
      threeSecondLoopState={[]}
      overlappingSnippetDataState={[]}
      setSentenceHighlightingState={() => {}}
      sentenceHighlightingState={''}
      isPressDownShiftState={false}
      masterPlay={''} //sentence.id
      isGenericItemLoadingState={[]}
      handleSaveWord={() => {}} //handleSaveWord
      handleDeleteWordDataProvider={() => {}} //handleDeleteWordDataProvider
      wordsState={wordsState}
      onlyShowEngState={false}
      setLoopTranscriptState={() => {}}
      loopTranscriptState={[]}
      handleReviewFunc={() => {}}
      isVideoPlaying={false} //isVideoPlaying
      handlePause={() => {}} //handlePause
      handleBreakdownSentence={() => {}}
      handleFromHere={() => {}} //handleAudio(transcriptItem.id, transcriptItem.time)
      setBreakdownSentencesArrState={() => {}}
      wordsForSelectedTopic={[]}
      isSentenceReviewMode
    >
      <TranscriptItem />
    </TranscriptItemProvider>
  );
};

export default SentencesUITranscriptItem;
