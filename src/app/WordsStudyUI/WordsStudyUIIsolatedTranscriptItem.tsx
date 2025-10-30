import { useFetchData } from '../Providers/FetchDataProvider';
import { getAudioURL } from '@/utils/get-media-url';
import { useRef, useState } from 'react';
import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import useData from '../Providers/useData';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import SingleSentenceAudioPlayer from '@/components/custom/SingleSentenceAudioPlayer';

const WordsStudyUIIsolatedTranscriptItem = ({ contextData }) => {
  const { languageSelectedState } = useFetchData();

  const hasAudio = contextData?.hasAudio;
  const title = contextData.title;
  const hasIndividualAudio = hasAudio;
  const source = hasIndividualAudio
    ? getAudioURL(contextData.id, languageSelectedState)
    : getAudioURL(title, languageSelectedState);

  const { wordsState } = useData();
  const [audioProgressState, setAudioProgressState] = useState(0);
  const [isPlayingsState, setIsPlayingsState] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setAudioProgressState(audio.currentTime);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlayAdhocSentence = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingsState) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      audio.play();
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlayingsState(!isPlayingsState);
  };

  const handlePause = () => audioRef.current?.pause();

  const { handleReviewFunc } = useWordsStudyUIScreen();

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
      isPressDownShiftState={false}
      masterPlay={isPlayingsState ? contextData.id : ''}
      isGenericItemLoadingState={[]}
      handleSaveWord={() => {}} //handleSaveWord
      handleDeleteWordDataProvider={() => {}} //handleDeleteWordDataProvider
      wordsState={wordsState}
      onlyShowEngState={false}
      setLoopTranscriptState={() => {}}
      loopTranscriptState={[]}
      handleReviewFunc={handleReviewFunc}
      isVideoPlaying={isPlayingsState} //isVideoPlaying
      handlePause={handlePause} //handlePause
      handleBreakdownSentence={() => {}}
      handleFromHere={togglePlayAdhocSentence} //handleAudio(transcriptItem.id, transcriptItem.time)
      setBreakdownSentencesArrState={() => {}}
      wordsForSelectedTopic={[]}
      isSentenceReviewMode
    >
      <div className='flex flex-col gap-1'>
        <SingleSentenceAudioPlayer
          audioRef={audioRef}
          src={source}
          audioProgressState={audioProgressState}
          setAudioProgressState={setAudioProgressState}
          setIsPlayingState={setIsPlayingsState}
        />
        <TranscriptItem />
      </div>
    </TranscriptItemProvider>
  );
};

export default WordsStudyUIIsolatedTranscriptItem;
