import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import VideoPlayer from '../VideoPlayer';
import WordsStudyUIAudioElFallback from './WordsStudyUIAudioElFallback';
import { getCloudflareVideoURL } from '@/utils/get-media-url';
import useCheckVideoIsWorking from './useCheckVideoIsWorking';
import useData from '../Providers/useData';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { mapSentenceIdsToSeconds } from '../LearningScreen/utils/map-sentence-ids-to-seconds';
import { useEffect, useState } from 'react';

const WordsStudyUIVideoEl = ({ contextDataEl }) => {
  const [secondsState, setSecondsState] = useState([]);
  const {
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
    handleTimeUpdate,
  } = useWordsStudyUIScreen();
  const { wordsState } = useData();
  const isMedia = contextDataEl.isMedia;
  const error = useCheckVideoIsWorking(ref);

  const transcriptArr = [
    contextDataEl?.previousSentence,
    contextDataEl,
    contextDataEl?.nextSentence,
  ];

  const currentTime = ref?.current?.currentTime;

  const masterPlay =
    secondsState?.length > 0 ? secondsState[Math.floor(currentTime)] : '';

  const handleAudio = (currentContext, contextTime) => {
    const currentContextIsMaster = currentContext === masterPlay;

    if (currentContextIsMaster) {
      isVideoPlaying
        ? handlePause()
        : handlePlayFromHere((contextDataEl.realStartTime || 0) + contextTime);
    } else {
      handlePlayFromHere((contextDataEl.realStartTime || 0) + contextTime);
    }
  };

  useEffect(() => {
    if (ref?.current?.duration && secondsState?.length === 0) {
      const secondsToArr = mapSentenceIdsToSeconds({
        content: transcriptArr,
        duration: ref?.current?.duration,
        isVideoModeState: true,
        realStartTime: contextDataEl.realStartTime,
      });
      setSecondsState(secondsToArr);
    }
  }, [ref?.current?.duration]);

  if (error) {
    return (
      <WordsStudyUIAudioElFallback
        contextDataEl={contextDataEl}
        secondsState={secondsState}
      />
    );
  }

  if (isMedia) {
    const videoUrl = getCloudflareVideoURL(
      contextDataEl.generalTopicName,
      'japanese',
    );

    return (
      <div>
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          setIsVideoPlaying={setIsVideoPlaying}
          masterPlayComprehensiveState={contextDataEl}
          handleTimeUpdate={handleTimeUpdate}
        />
        <div className='flex flex-col gap-2 mt-2'>
          {transcriptArr?.map((transcriptItem, index) => {
            return (
              <TranscriptItemProvider
                key={index}
                threeSecondLoopState={[]}
                overlappingSnippetDataState={[]}
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
                handleBreakdownSentence={() => {}}
                handleFromHere={() =>
                  handleAudio(transcriptItem.id, transcriptItem.time)
                }
                setBreakdownSentencesArrState={() => {}}
                isBreakingDownSentenceArrState={[]}
                latestDueIdState={false}
                scrollToElState={''}
                wordsForSelectedTopic={[]}
                isWordStudyMode={true}
              >
                <TranscriptItem />
              </TranscriptItemProvider>
            );
          })}
        </div>
      </div>
    );
  }
};

export default WordsStudyUIVideoEl;
