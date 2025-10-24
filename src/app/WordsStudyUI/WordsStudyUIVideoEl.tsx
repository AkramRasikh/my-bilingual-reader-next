import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import VideoPlayer from '../VideoPlayer';
import WordsStudyUIAudioElFallback from './WordsStudyUIAudioElFallback';
import { getCloudflareVideoURL } from '@/utils/get-media-url';
import useCheckVideoIsWorking from './useCheckVideoIsWorking';
import useData from '../Providers/useData';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { mapSentenceIdsToSeconds } from '../LearningScreen/utils/map-sentence-ids-to-seconds';
import { useEffect, useRef, useState } from 'react';
import WordsStudyUIKeyListener from './WordsStudyUIKeyListener';
import useManageThreeSecondLoop from '../LearningScreen/hooks/useManageThreeSecondLoop';
import useManageLoopInit from '../LearningScreen/hooks/useManageLoopInit';
import LoopIndicatorWithProgress from '@/components/custom/LoopIndicatorWithProgress';
import LoopBtn from '@/components/custom/LoopBtn';
import { useFetchData } from '../Providers/FetchDataProvider';

const WordsStudyUIVideoEl = ({ contextDataEl }) => {
  const [secondsState, setSecondsState] = useState([]);
  const transcriptStringRef = useRef('');

  const {
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
    handleTimeUpdate,
    contractThreeSecondLoopState,
    threeSecondLoopState,
    setThreeSecondLoopState,
    setOverlappingSnippetDataState,
    overlappingSnippetDataState,
    setContractThreeSecondLoopState,
    progress,
    setProgress,
  } = useWordsStudyUIScreen();
  const { languageSelectedState } = useFetchData();

  const { wordsState, handleSaveWord, handleDeleteWordDataProvider } =
    useData();
  const isMedia = contextDataEl.isMedia;
  const error = useCheckVideoIsWorking(ref);

  const transcriptArr = [
    contextDataEl?.previousSentence,
    contextDataEl,
    contextDataEl?.nextSentence,
  ].filter((item) => item);

  const idsOfTranscript = transcriptArr.map((item) => item.id).join('');

  const currentTime = ref?.current?.currentTime;

  const masterPlay =
    secondsState?.length > 0 ? secondsState[Math.floor(currentTime)] : '';

  const realStartTimeAudioVideo = error ? 0 : contextDataEl.realStartTime;

  useManageThreeSecondLoop({
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState: transcriptArr,
    realStartTime: realStartTimeAudioVideo,
    setOverlappingSnippetDataState,
    overlappingSnippetDataState,
  });

  useManageLoopInit({
    ref,
    threeSecondLoopState,
    contractThreeSecondLoopState,
    loopTranscriptState: [],
    setContractThreeSecondLoopState,
    masterPlay,
    progress: null,
  });

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
    if (!idsOfTranscript || !transcriptStringRef.current) {
      return;
    }
    if (idsOfTranscript && idsOfTranscript !== transcriptStringRef.current) {
      setSecondsState([]);
    }
  }, [idsOfTranscript, transcriptStringRef]);

  const handleJumpToSentenceViaKeys = (nextIndex: number) => {
    // defo revisit this

    const thisSentenceIndex = transcriptArr.findIndex(
      (item) => item.id === masterPlay,
    );

    if (thisSentenceIndex === -1) {
      return;
    }
    if (thisSentenceIndex === 0 && nextIndex === -1) {
      handlePlayFromHere(
        realStartTimeAudioVideo + transcriptArr[thisSentenceIndex]?.time,
      );
    } else {
      handlePlayFromHere(
        realStartTimeAudioVideo +
          transcriptArr[thisSentenceIndex + nextIndex]?.time,
      );
    }
  };

  useEffect(() => {
    if (ref?.current?.duration && secondsState?.length === 0) {
      const secondsToArr = mapSentenceIdsToSeconds({
        content: transcriptArr,
        duration: ref?.current?.duration,
        isVideoModeState: true,
        // realStartTime: 0,
        realStartTime: error ? 0 : contextDataEl.realStartTime,
      });
      setSecondsState(secondsToArr);
      transcriptStringRef.current = idsOfTranscript;
    }
  }, [ref?.current?.duration, secondsState]);

  if (error) {
    return (
      <>
        {threeSecondLoopState && (
          <div className='flex m-auto'>
            <div className='w-9/12 m-auto'>
              <LoopIndicatorWithProgress
                ref={ref}
                threeSecondLoopState={threeSecondLoopState}
                progress={progress}
                setProgress={setProgress}
                contractThreeSecondLoopState={contractThreeSecondLoopState}
              />
            </div>
            <LoopBtn
              threeSecondLoopState={threeSecondLoopState}
              setThreeSecondLoopState={setThreeSecondLoopState}
              contractThreeSecondLoopState={contractThreeSecondLoopState}
              isVideoPlaying={isVideoPlaying}
            />
          </div>
        )}
        <WordsStudyUIAudioElFallback
          contextDataEl={contextDataEl}
          secondsState={secondsState}
          languageSelectedState={languageSelectedState}
        />
        <WordsStudyUIKeyListener
          handleJumpToSentenceViaKeys={handleJumpToSentenceViaKeys}
        />
      </>
    );
  }

  if (isMedia) {
    const videoUrl = getCloudflareVideoURL(
      contextDataEl.generalTopicName,
      languageSelectedState,
    );

    return (
      <div className='max-w-2xl'>
        <div>
          <VideoPlayer
            ref={ref}
            url={videoUrl}
            setIsVideoPlaying={setIsVideoPlaying}
            masterPlayComprehensiveState={contextDataEl}
            handleTimeUpdate={handleTimeUpdate}
          />
          {threeSecondLoopState && (
            <div className='flex m-auto'>
              <div className='w-9/12 m-auto'>
                <LoopIndicatorWithProgress
                  ref={ref}
                  threeSecondLoopState={threeSecondLoopState}
                  progress={progress}
                  setProgress={setProgress}
                  contractThreeSecondLoopState={contractThreeSecondLoopState}
                />
              </div>
              <LoopBtn
                threeSecondLoopState={threeSecondLoopState}
                setThreeSecondLoopState={setThreeSecondLoopState}
                contractThreeSecondLoopState={contractThreeSecondLoopState}
                isVideoPlaying={isVideoPlaying}
              />
            </div>
          )}
        </div>
        <div className='flex flex-col gap-2 mt-2'>
          {transcriptArr?.map((transcriptItem, index) => {
            return (
              <TranscriptItemProvider
                key={index}
                threeSecondLoopState={[]}
                overlappingSnippetDataState={overlappingSnippetDataState}
                setSentenceHighlightingState={() => {}}
                sentenceHighlightingState={''}
                contentItem={transcriptItem}
                isPressDownShiftState={false}
                breakdownSentencesArrState={[]}
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
          <WordsStudyUIKeyListener
            handleJumpToSentenceViaKeys={handleJumpToSentenceViaKeys}
          />
        </div>
      </div>
    );
  }
};

export default WordsStudyUIVideoEl;
