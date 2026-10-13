import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import LearningScreenActionBarVideoControls from './LearningScreenActionBarVideoControls';

type LearningScreenContentChapterNavigationProps = {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
};

const LearningScreenContentChapterNavigation = ({
  isRightPanelOpen,
  onToggleRightPanel,
}: LearningScreenContentChapterNavigationProps) => {
  const panelLabel = isRightPanelOpen
    ? 'Hide transcript panel'
    : 'Show transcript panel';
  const PanelIcon = isRightPanelOpen ? PanelRightClose : PanelRightOpen;

  return (
    <section
      aria-label='Learning settings'
      className='flex flex-col items-center gap-3'
    >
      <LearningScreenActionBarVideoControls />
      <LearningScreenUnifiedAnalytics />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8'
        aria-pressed={isRightPanelOpen}
        aria-label={panelLabel}
        data-testid='right-panel-toggle'
        onClick={onToggleRightPanel}
      >
        <PanelIcon className='size-4' />
      </Button>
    </section>
  );
};

export default LearningScreenContentChapterNavigation;
