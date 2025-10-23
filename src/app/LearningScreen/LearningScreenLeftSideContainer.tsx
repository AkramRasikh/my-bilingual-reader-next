import { getCloudflareVideoURL } from '../../utils/get-media-url';
import { getGeneralTopicName } from '../../utils/get-general-topic-name';
import KeyListener from './LearningScreenKeyListener';
import VideoPlayer from '../VideoPlayer';
import TranscriptItemSecondary from '../../components/custom/TranscriptItem/TranscriptItemSecondary';
import useLearningScreen from './useLearningScreen';
import LearningScreenActionBar from './LearningScreenActionBar';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';
import { useFetchData } from '../Providers/FetchDataProvider';

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

  return (
    <div className='flex-1 max-w-xl mx-auto'>
      <LearningScreenActionBarVideoControls />
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
      <LearningScreenActionBar />
      {masterPlayComprehensiveState && (
        <TranscriptItemSecondary contentItem={masterPlayComprehensiveState} />
      )}
      <KeyListener />
    </div>
  );
};

export default LearningScreenLeftSideContainer;
