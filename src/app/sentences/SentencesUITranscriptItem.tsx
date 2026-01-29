import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useFetchData } from '../Providers/FetchDataProvider';
import { useSentencesUIScreen } from './SentencesUIProvider';
import SingleSentenceAudioPlayer from '@/components/custom/SingleSentenceAudioPlayer';

const SentencesUITranscriptItem = ({ sentence, sentenceNum, isSelected }) => {
  const { wordsState, languageSelectedState } = useFetchData();
  const {
    handleReviewFunc,
    selectedSentenceDataMemoized,
    togglePlay,
    masterPlay,
    isPlayingState,
    handlePause,
    audioProgressState,
    setAudioProgressState,
    audioRef,
    setIsPlayingState,
    setSelectedElState,
  } = useSentencesUIScreen();

  const handleTogglePlay = (arg) => {
    if (!isSelected) {
      setSelectedElState(sentenceNum);
      setTimeout(() => togglePlay(arg), 100);
    } else {
      togglePlay(arg);
    }
  };

  const sentenceIndex = sentenceNum + 1 + ') ';
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
      masterPlay={masterPlay}
      isGenericItemLoadingState={[]}
      snippetLoadingState={[]}
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
      handleFromHere={handleTogglePlay} //handleAudio(transcriptItem.id, transcriptItem.time)
      setBreakdownSentencesArrState={() => {}}
      wordsForSelectedTopic={[]}
      isSentenceReviewMode
    >
      <div className={'flex flex-col gap-1'}>
        {isSelected && (
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
