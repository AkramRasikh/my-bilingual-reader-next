import { getAudioURL } from '@/utils/get-media-url';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { TranscriptItemProvider } from '@/components/custom/TranscriptItem/TranscriptItemProvider';
import useData from '../Providers/useData';
import TranscriptItem from '@/components/custom/TranscriptItem';

const WordsStudyUIAudioElFallback = ({ contextDataEl }) => {
  const {
    ref,
    isVideoPlaying,
    handlePause,
    handlePlayFromHere,
    setIsVideoPlaying,
  } = useWordsStudyUIScreen();

  const { wordsState } = useData();

  const audioUrl = getAudioURL(contextDataEl.title, 'japanese');

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

  const handleAudio = (contextTime) =>
    isVideoPlaying ? handlePause() : handlePlayFromHere(contextTime);

  const transcriptArr = [
    contextDataEl?.previousSentence,
    contextDataEl,
    contextDataEl?.nextSentence,
  ];

  return (
    <div>
      <div className='flex gap-3 mb-2'>
        <audio ref={ref} src={audioUrl} controls className='w-full' />
        <Button className='my-auto' onClick={handleAudio}>
          {isVideoPlaying ? 'Pause' : 'Play'}
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
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
      {/* <div className='backdrop-blur-xs backdrop-brightness-75  p-1 m-1 rounded-lg'>
        {contextDataEl?.previousSentence && (
          <p className='text-center font-bold text-lg italic text-gray-700'>
            {contextDataEl.previousSentence}
          </p>
        )}
        {contextDataEl?.targetLang && (
          <p className='text-center font-bold text-xl text-blue-900'>
            {contextDataEl.targetLang}
          </p>
        )}
        {contextDataEl?.nextSentence && (
          <p className='text-center font-bold text-lg italic text-gray-700'>
            {contextDataEl.nextSentence}
          </p>
        )}
      </div>
      <p className='text-sm font-medium italic my-auto text-right'>
        {contextDataEl.title}
      </p> */}
    </div>
  );
};

export default WordsStudyUIAudioElFallback;
