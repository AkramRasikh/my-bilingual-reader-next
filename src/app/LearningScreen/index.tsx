import { useState } from 'react';
import useLearningScreen from './useLearningScreen';
import LearningScreenContentContainer from './LearningScreenContentContainer';
import LearningScreenLeftSideContainer from './LearningScreenLeftSideContainer';
import LearningScreenContentChapterNavigation from './LearningScreenContentChapterNavigation';

const LearningScreen = () => {
  const { formattedTranscriptState, secondsState, selectedContentState } =
    useLearningScreen();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  if (!formattedTranscriptState || !selectedContentState) {
    return null;
  }

  return (
    <div className='mt-4 flex w-full min-w-0 gap-5 xl:mx-auto xl:w-fit'>
      <div className='max-xl:[zoom:0.70] shrink-0'>
        <LearningScreenContentChapterNavigation
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen((open) => !open)}
        />
      </div>
      <LearningScreenLeftSideContainer isRightPanelOpen={isRightPanelOpen} />
      {isRightPanelOpen && secondsState.length > 0 && (
        <LearningScreenContentContainer />
      )}
    </div>
  );
};

export default LearningScreen;
