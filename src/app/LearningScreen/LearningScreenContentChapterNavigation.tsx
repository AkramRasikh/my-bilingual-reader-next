import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

const LearningScreenContentChapterNavigation = () => {
  return (
    <section
      aria-label='Learning settings'
      className='flex flex-col items-center gap-3'
    >
      <h2 className='text-center text-xs font-medium text-muted-foreground'>
        Learning settings
      </h2>
      <LearningScreenActionBarVideoControls />
      <LearningScreenUnifiedAnalytics />
    </section>
  );
};

export default LearningScreenContentChapterNavigation;
