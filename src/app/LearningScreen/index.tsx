import useLearningScreen from './useLearningScreen';
import LearningScreenContentContainer from './LearningScreenContentContainer';
import LearningScreenLeftSideContainer from './LearningScreenLeftSideContainer';
import LearningScreenContentChapterNavigation from './LearningScreenContentChapterNavigation';

const LearningScreen = () => {
  const { formattedTranscriptState, secondsState, selectedContentState } =
    useLearningScreen();

  if (!formattedTranscriptState || !selectedContentState) {
    return null;
  }

  return (
    <div className='flex gap-5 w-fit mx-auto mt-4'>
      <LearningScreenContentChapterNavigation />
      <LearningScreenLeftSideContainer />
      {secondsState.length > 0 && <LearningScreenContentContainer />}
    </div>
  );
};

export default LearningScreen;
