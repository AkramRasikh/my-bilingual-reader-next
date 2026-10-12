import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

const LearningScreenContentChapterNavigation = () => {
  return (
    <section
      aria-label='Learning settings'
      className='flex flex-col items-center gap-3'
    >
      <LearningScreenActionBarVideoControls />
      <LearningScreenUnifiedAnalytics />
    </section>
  );
};

export default LearningScreenContentChapterNavigation;
