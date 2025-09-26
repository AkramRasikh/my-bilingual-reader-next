import { getFirebaseVideoURL } from '../get-firebase-media-url';
import { getGeneralTopicName } from '../get-general-topic-name';
import { japanese } from '../languages';
import KeyListener from '../KeyListener';
import VideoPlayer from '../VideoPlayer';
import useData from '../useData';
import ComprehensiveTranscriptItem from '../ComprehensiveTranscriptItem';
import useLearningScreen from './useLearningScreen';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import LearningScreenActionBar from './LearningScreenActionBar';

const LearningScreenLeftSideContainer = () => {
  const {
    masterPlayComprehensiveState,
    setIsVideoPlaying,
    threeSecondLoopState,
    ref,
    handleTimeUpdate,
    showOnVideoTranscriptState,
  } = useLearningScreen();

  const { selectedContentState } = useData();

  const isFullReview = selectedContentState?.isFullReview;

  const generalTopic = isFullReview
    ? selectedContentState.title
    : getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);

  return (
    <div className='flex-1 max-w-xl mx-auto'>
      <VideoPlayer
        ref={ref}
        url={videoUrl}
        handleTimeUpdate={handleTimeUpdate}
        setIsVideoPlaying={setIsVideoPlaying}
        masterPlayComprehensiveState={
          showOnVideoTranscriptState && masterPlayComprehensiveState
        }
      />
      <LearningScreenActionBar />

      {threeSecondLoopState && <LearningScreenLoopUI />}
      {masterPlayComprehensiveState && (
        <ComprehensiveTranscriptItem
          contentItem={masterPlayComprehensiveState}
        />
      )}
      <KeyListener />
    </div>
  );
};

export default LearningScreenLeftSideContainer;
