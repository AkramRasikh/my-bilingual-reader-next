import { Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LearningScreenMetaPanel from './TabContent/LearningScreenMetaPanel';
import useLearningScreen from './useLearningScreen';

// The Meta tab lives in the right panel, which can't open for content without a video
// (e.g. Netflix imports), so the same panel is also reachable from the side bar.
const LearningScreenMetaModal = () => {
  const { selectedContentState } = useLearningScreen();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          aria-label='Content settings'
          title='Review status, export and delete'
          data-testid='content-meta-toggle'
        >
          <Settings2 className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='flex max-h-[85vh] flex-col sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Content settings</DialogTitle>
          <DialogDescription className='truncate'>
            {selectedContentState?.title}
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 overflow-y-auto overflow-x-hidden p-1'>
          <LearningScreenMetaPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningScreenMetaModal;
