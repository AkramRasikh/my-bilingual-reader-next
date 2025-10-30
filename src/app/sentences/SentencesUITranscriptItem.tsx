import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import useData from '../Providers/useData';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useSentencesUIScreen } from './SentencesUIProvider';
import SingleSentenceAudioPlayer from '@/components/custom/SingleSentenceAudioPlayer';

const SentencesUITranscriptItem = ({ sentence, sentenceNum }) => {
  const { wordsState } = useData();
  const { languageSelectedState } = useFetchData();
  const {
    handleReviewFunc,
    selectedSentenceDataMemoized,
    togglePlay,
    selectedElState,
    masterPlay,
    isPlayingState,
    handlePause,
    audioProgressState,
    setAudioProgressState,
    audioRef,
    setIsPlayingState,
  } = useSentencesUIScreen();

  const sentenceIndex = sentenceNum + 1 + ') ';
  const thisSentenceIsSelected = selectedElState === sentenceNum;
  const thisItemsAudioUrl = selectedSentenceDataMemoized?.audioUrl;

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
      masterPlay={masterPlay}
      isGenericItemLoadingState={[]}
      handleSaveWord={() => {}} //handleSaveWord
      handleDeleteWordDataProvider={() => {}} //handleDeleteWordDataProvider
      wordsState={wordsState}
      onlyShowEngState={false}
      setLoopTranscriptState={() => {}}
      loopTranscriptState={[]}
      handleReviewFunc={handleReviewFunc}
      isVideoPlaying={isPlayingState} //isVideoPlaying
      handlePause={handlePause} //handlePause
      handleBreakdownSentence={() => {}}
      handleFromHere={togglePlay} //handleAudio(transcriptItem.id, transcriptItem.time)
      setBreakdownSentencesArrState={() => {}}
      wordsForSelectedTopic={[]}
      isSentenceReviewMode
    >
      <div className='flex flex-col gap-1'>
        {thisSentenceIsSelected && (
          <SingleSentenceAudioPlayer
            src={thisItemsAudioUrl}
            audioProgressState={audioProgressState}
            setAudioProgressState={setAudioProgressState}
            audioRef={audioRef}
            setIsPlayingState={setIsPlayingState}
          />
        )}
        <TranscriptItem />
      </div>
    </TranscriptItemProvider>
  );
};

export default SentencesUITranscriptItem;
