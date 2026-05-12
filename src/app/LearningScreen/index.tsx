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
    <div className='mt-4 flex w-full min-w-0 gap-5 xl:mx-auto xl:w-fit'>
      <div className='shrink-0'>
        <LearningScreenContentChapterNavigation />
      </div>
      <LearningScreenLeftSideContainer />
      {secondsState.length > 0 && <LearningScreenContentContainer />}
    </div>
  );
};

export default LearningScreen;
