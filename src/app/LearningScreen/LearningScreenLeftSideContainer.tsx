import { useMemo } from 'react';
import { getAudioURL, getCloudflareVideoURL } from '../../utils/get-media-url';
import KeyListener from './LearningScreenKeyListener';
import VideoPlayer from '../VideoPlayer';
import TranscriptItemSecondary from '../../components/custom/TranscriptItem/TranscriptItemSecondary';
import useLearningScreen from './useLearningScreen';
import LearningScreenActionBar from './LearningScreenActionBar';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';
import { useFetchData } from '../Providers/FetchDataProvider';
import AudioPlayer from '@/components/AudioPlayer';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreenLoopBtn';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import useCheckVideoIsWorking from '../WordsStudyUI/useCheckVideoIsWorking';
import TranscriptTimeline from '@/components/experimental/TranscriptTimeline';

const LearningScreenLeftSideContainer = () => {
  const {
    masterPlayComprehensiveState,
    setIsVideoPlaying,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    selectedContentState,
    errorVideoState,
    setErrorVideoState,
    wordsForSelectedTopic,
    learnFormattedTranscript,
    firstTime,
    handleSaveSnippet,
    overlappingTextMemoized,
    snippetsWithDueStatusMemoized,
  } = useLearningScreen();
  const { languageSelectedState, handleSaveWord } = useFetchData();

  const generalTopic = selectedContentState?.title;
  const videoUrl = getCloudflareVideoURL(generalTopic, languageSelectedState);

  useCheckVideoIsWorking(ref, setErrorVideoState);

  const audioUrl = getAudioURL(
    selectedContentState.title,
    languageSelectedState,
  );

  const timelineContentMemoized = useMemo(() => {
    return {
      words: wordsForSelectedTopic.filter((item) => item.isDue),
      sentences: learnFormattedTranscript.filter(
        (item) => item.dueStatus === 'now',
      ),
    };
  }, [wordsForSelectedTopic, learnFormattedTranscript]);

  const { words, sentences } = timelineContentMemoized;

  return (
    <div className='flex-1 w-xl mx-auto'>
      <LearningScreenActionBarVideoControls />
      {!errorVideoState ? (
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          handleTimeUpdate={handleTimeUpdate}
          setIsVideoPlaying={setIsVideoPlaying}
          threeSecondLoopState={threeSecondLoopState}
          handleSaveSnippet={handleSaveSnippet}
          overlappingTextMemoized={overlappingTextMemoized}
        />
      ) : (
        <div>
          <AudioPlayer
            ref={ref}
            handleTimeUpdate={handleTimeUpdate}
            audioUrl={audioUrl}
            setIsVideoPlaying={setIsVideoPlaying}
          />
          {threeSecondLoopState && <LearningScreenLoopUI />}
          <div
            className={clsx(
              threeSecondLoopState ? 'flex w-full justify-between' : '',
            )}
          >
            {masterPlayComprehensiveState?.targetLang && (
              <p className='text-center font-bold text-xl text-blue-900  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
                {masterPlayComprehensiveState.targetLang}
              </p>
            )}
            {threeSecondLoopState && <LearningScreenLoopBtn />}
          </div>
        </div>
      )}
      {ref?.current?.duration ? (
        <TranscriptTimeline
          videoDuration={ref.current.duration}
          words={words}
          sentences={sentences}
          snippets={snippetsWithDueStatusMemoized}
          onSelectSentence={(e) => console.log('## onSelectSentence', e)}
          onSelectWord={(e) => console.log('## onSelectWord', e)}
          onSelectSnippet={(e) => console.log('## onSelectSnippet', e)}
          firstTime={firstTime}
        />
      ) : null}
      <LearningScreenActionBar />
      {masterPlayComprehensiveState && (
        <TranscriptItemSecondary
          contentItem={masterPlayComprehensiveState}
          handleSaveWord={handleSaveWord}
        />
      )}
      <KeyListener />
    </div>
  );
};

export default LearningScreenLeftSideContainer;
