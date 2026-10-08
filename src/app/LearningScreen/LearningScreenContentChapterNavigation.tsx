import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

const LearningScreenContentChapterNavigation = () => {
  return (
    <div className='flex flex-col items-center gap-2'>
      <LearningScreenActionBarVideoControls />
      <LearningScreenUnifiedAnalytics />
    </div>
  );
};

export default LearningScreenContentChapterNavigation;
