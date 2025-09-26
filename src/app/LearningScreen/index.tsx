import useData from '../useData';
import useLearningScreen from './useLearningScreen';
import LearningScreenContentContainer from './LearningScreenContentContainer';
import LearningScreenLeftSideContainer from './LearningScreenLeftSideContainer';
import LearningScreenContentChapterNavigation from './LearningScreenContentChapterNavigation';

const LearningScreen = () => {
  const { formattedTranscriptState, secondsState } = useLearningScreen();

  const { updateContentMetaData, getNextTranscript, selectedContentState } =
    useData();

  const isFullReview = selectedContentState?.isFullReview;

  const content = selectedContentState.content;
  const contentIndex = selectedContentState?.contentIndex;

  const reviewHistory = selectedContentState?.reviewHistory;
  const hasContentToReview = content?.some(
    (sentenceWidget) => sentenceWidget?.reviewData,
  );

  if (!formattedTranscriptState) {
    return null;
  }

  const hasPreviousVideo = !selectedContentState.isFirst;
  const hasFollowingVideo = selectedContentState.hasFollowingVideo;

  return (
    <div className='flex gap-5 w-fit mx-auto'>
      <LearningScreenContentChapterNavigation />
      <LearningScreenLeftSideContainer />
      {secondsState && (
        <LearningScreenContentContainer
          hasPreviousVideo={hasPreviousVideo}
          hasFollowingVideo={hasFollowingVideo}
          getNextTranscript={getNextTranscript}
          hasContentToReview={hasContentToReview}
          reviewHistory={reviewHistory}
          updateContentMetaData={updateContentMetaData}
          topicName={!isFullReview && selectedContentState?.title}
          contentIndex={contentIndex}
        />
      )}
    </div>
  );
};

export default LearningScreen;
