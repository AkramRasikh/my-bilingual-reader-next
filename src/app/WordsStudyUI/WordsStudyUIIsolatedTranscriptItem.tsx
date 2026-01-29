import { useFetchData } from '../Providers/FetchDataProvider';
import { getAudioURL } from '@/utils/get-media-url';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SingleSentenceAudioPlayer from '@/components/custom/SingleSentenceAudioPlayer';

const WordsStudyUIIsolatedTranscriptItem = ({ contextData }) => {
  const { languageSelectedState, wordsState } = useFetchData();

  const hasAudio = contextData?.hasAudio;
  const title = contextData.title;
  const hasIndividualAudio = hasAudio;
  const source = hasIndividualAudio
    ? getAudioURL(contextData.id, languageSelectedState)
    : getAudioURL(title, languageSelectedState);

  const {
    handleReviewFunc,
    togglePlayAdhocSentence,
    seperateSentenceAudioRef,
    isSentencePlayingsState,
    handleSeperatedSentencePause,
    setAudioSentenceProgressState,
    audioSentenceProgressState,
    setIsSentencePlayingsState,
  } = useWordsStudyUIScreen();

  return (
    <TranscriptItemProvider
      contentItem={contextData}
      languageSelectedState={languageSelectedState}
      breakdownSentencesArrState={[]}
      isBreakingDownSentenceArrState={[]}
      threeSecondLoopState={[]}
      overlappingSnippetDataState={[]}
      setSentenceHighlightingState={() => {}}
      sentenceHighlightingState={''}
      masterPlay={isSentencePlayingsState ? contextData.id : ''}
      isGenericItemLoadingState={[]}\n      snippetLoadingState={[]}
      handleSaveWord={() => {}} //handleSaveWord
      handleDeleteWordDataProvider={() => {}} //handleDeleteWordDataProvider
      wordsState={wordsState}
      onlyShowEngState={false}
      setLoopTranscriptState={() => {}}
      loopTranscriptState={[]}
      handleReviewFunc={handleReviewFunc}
      isVideoPlaying={isSentencePlayingsState} //isVideoPlaying
      handlePause={handleSeperatedSentencePause} //handlePause
      handleBreakdownSentence={() => {}}
      handleFromHere={togglePlayAdhocSentence} //handleAudio(transcriptItem.id, transcriptItem.time)
      setBreakdownSentencesArrState={() => {}}
      wordsForSelectedTopic={[]}
      isSentenceReviewMode
    >
      <div className='flex flex-col gap-1'>
        <SingleSentenceAudioPlayer
          audioRef={seperateSentenceAudioRef}
          src={source}
          audioProgressState={audioSentenceProgressState}
          setAudioProgressState={setAudioSentenceProgressState}
          setIsPlayingState={setIsSentencePlayingsState}
        />
        <TranscriptItem />
      </div>
    </TranscriptItemProvider>
  );
};

export default WordsStudyUIIsolatedTranscriptItem;
