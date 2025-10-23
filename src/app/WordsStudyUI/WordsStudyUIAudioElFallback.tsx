import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { useEffect } from 'react';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import useData from '../Providers/useData';
import TranscriptItem from '@/components/custom/TranscriptItem';

const WordsStudyUIAudioElFallback = ({
  secondsState,
  contextDataEl,
  languageSelectedState,
}) => {
  const {
    ref,
    isVideoPlaying,
    handlePause,
    handlePlayFromHere,
    setIsVideoPlaying,
    handleTimeUpdate,
    overlappingSnippetDataState,
  } = useWordsStudyUIScreen();

  const { wordsState } = useData();

  const audioUrl = getAudioURL(contextDataEl.title, languageSelectedState);
  const currentTime = ref?.current?.currentTime;
  const masterPlay =
    secondsState?.length > 0 ? secondsState[Math.floor(currentTime)] : '';

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleAudio = (currentContext, contextTime) => {
    const currentContextIsMaster = currentContext === masterPlay;

    if (currentContextIsMaster) {
      isVideoPlaying ? handlePause() : handlePlayFromHere(contextTime); // issue of has video vs no video on realStartTime
    } else {
      handlePlayFromHere(contextTime);
    }
  };

  const transcriptArr = [
    contextDataEl?.previousSentence,
    contextDataEl,
    contextDataEl?.nextSentence,
  ].filter((item) => item);

  return (
    <div>
      <div className='flex gap-3 mb-2'>
        <audio
          ref={ref}
          src={audioUrl}
          controls
          className='w-full'
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className='flex flex-col gap-2'>
        {transcriptArr?.map((transcriptItem, index) => {
          return (
            <div key={index}>
              <TranscriptItemProvider
                threeSecondLoopState={[]}
                overlappingSnippetDataState={overlappingSnippetDataState}
                setSentenceHighlightingState={() => {}}
                sentenceHighlightingState={''}
                contentItem={transcriptItem}
                isPressDownShiftState={false}
                breakdownSentencesArrState={[]}
                masterPlay={masterPlay}
                isGenericItemLoadingState={[]}
                handleSaveWord={() => {}}
                handleDeleteWordDataProvider={() => {}}
                wordsState={wordsState}
                isInReviewMode={false}
                onlyShowEngState={false}
                setLoopTranscriptState={() => {}}
                loopTranscriptState={[]}
                handleReviewFunc={() => {}}
                isVideoPlaying={isVideoPlaying}
                handlePause={handlePause}
                handleFromHere={() =>
                  handleAudio(transcriptItem.id, transcriptItem.time)
                }
                handleBreakdownSentence={() => {}}
                setBreakdownSentencesArrState={() => {}}
                isBreakingDownSentenceArrState={[]}
                latestDueIdState={false}
                scrollToElState={''}
                wordsForSelectedTopic={[]}
                isWordStudyMode={true}
              >
                <TranscriptItem />
              </TranscriptItemProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordsStudyUIAudioElFallback;
