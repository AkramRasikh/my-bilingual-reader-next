import { getAudioURL, getCloudflareVideoURL } from '../../utils/get-media-url';
import { getGeneralTopicName } from '../../utils/get-general-topic-name';
import KeyListener from './LearningScreenKeyListener';
import VideoPlayer from '../VideoPlayer';
import TranscriptItemSecondary from '../../components/custom/TranscriptItem/TranscriptItemSecondary';
import useLearningScreen from './useLearningScreen';
import LearningScreenActionBar from './LearningScreenActionBar';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';
import { useFetchData } from '../Providers/FetchDataProvider';
import useCheckVideoIsWorking from '../WordsStudyUI/useCheckVideoIsWorking';
import AudioPlayer from '@/components/AudioPlayer';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreenLoopBtn';
import LearningScreenLoopUI from './LearningScreenLoopUI';

const LearningScreenLeftSideContainer = () => {
  const {
    masterPlayComprehensiveState,
    setIsVideoPlaying,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    showOnVideoTranscriptState,
    selectedContentState,
  } = useLearningScreen();
  const { languageSelectedState } = useFetchData();

  const isFullReview = selectedContentState?.isFullReview;

  const generalTopic = isFullReview
    ? selectedContentState?.title
    : getGeneralTopicName(selectedContentState?.title);
  const videoUrl = getCloudflareVideoURL(generalTopic, languageSelectedState);
  const audioUrl = getAudioURL(generalTopic, languageSelectedState);
  const errorInVideo = useCheckVideoIsWorking(ref);

  return (
    <div className='flex-1 max-w-xl mx-auto'>
      <LearningScreenActionBarVideoControls />
      {!errorInVideo ? (
        <VideoPlayer
          ref={ref}
          url={videoUrl}
          handleTimeUpdate={handleTimeUpdate}
          setIsVideoPlaying={setIsVideoPlaying}
          masterPlayComprehensiveState={
            showOnVideoTranscriptState && masterPlayComprehensiveState
          }
          threeSecondLoopState={threeSecondLoopState}
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
      <LearningScreenActionBar />
      {masterPlayComprehensiveState && (
        <TranscriptItemSecondary contentItem={masterPlayComprehensiveState} />
      )}
      <KeyListener />
    </div>
  );
};

export default LearningScreenLeftSideContainer;
