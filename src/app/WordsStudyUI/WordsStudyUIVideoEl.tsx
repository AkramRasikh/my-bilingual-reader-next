import TranscriptItem from '@/components/custom/TranscriptItem';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import VideoPlayer from '../VideoPlayer';
import WordsStudyUIAudioElFallback from './WordsStudyUIAudioElFallback';
import { getCloudflareVideoURL } from '@/utils/get-media-url';
import useCheckVideoIsWorking from './useCheckVideoIsWorking';
import useData from '../Providers/useData';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';

const WordsStudyUIVideoEl = ({ contextDataEl }) => {
  const {
    ref,
    setIsVideoPlaying,
    isVideoPlaying,
    handlePlayFromHere,
    handlePause,
  } = useWordsStudyUIScreen();
  const { wordsState } = useData();
  const isMedia = contextDataEl.isMedia;
  const error = useCheckVideoIsWorking(ref);

  const handleAudio = (contextTime) =>
    isVideoPlaying
      ? handlePause()
      : handlePlayFromHere((contextDataEl.realStartTime || 0) + contextTime);

  if (error) {
    return <WordsStudyUIAudioElFallback contextDataEl={contextDataEl} />;
  }

  if (isMedia) {
    const videoUrl = getCloudflareVideoURL(
      contextDataEl.generalTopicName,
      'japanese',
    );

    const transcriptArr = [
      contextDataEl?.previousSentence,
      contextDataEl,
      contextDataEl?.nextSentence,
    ];

    return (
      <div>
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          setIsVideoPlaying={setIsVideoPlaying}
          masterPlayComprehensiveState={contextDataEl}
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
                masterPlay={contextDataEl.id}
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
                handleFromHere={() => handleAudio(transcriptItem.time)}
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
            );
          })}
        </div>
      </div>
    );
  }
};

export default WordsStudyUIVideoEl;
