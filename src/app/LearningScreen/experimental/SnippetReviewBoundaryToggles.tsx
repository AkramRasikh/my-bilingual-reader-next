import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { MoveLeftIcon, MoveRightIcon, SaveIcon, Undo2Icon } from 'lucide-react';

interface SnippetReviewBoundaryTogglesProps {
  isLoading: boolean;
  indexHasChanged: boolean;
  onMoveLeft: () => void;
  onReset: () => void;
  onMoveRight: () => void;
  onContractLength: () => void;
  onExpandLength: () => void;
  onUpdateSnippet: () => void;
}

const SnippetReviewBoundaryToggles = ({
  isLoading,
  indexHasChanged,
  onMoveLeft,
  onReset,
  onMoveRight,
  onContractLength,
  onExpandLength,
  onUpdateSnippet,
}: SnippetReviewBoundaryTogglesProps) => (
  <div className='flex flex-col gap-2 m-auto justify-center mb-3'>
    <div className='flex flex-row gap-2 justify-center'>
      <Button onClick={onMoveLeft} variant='outline' disabled={isLoading}>
        <MoveLeftIcon />
      </Button>
      <Button onClick={onMoveRight} variant='outline' disabled={isLoading}>
        <MoveRightIcon />
      </Button>
    </div>
    <div className='flex flex-row gap-2 justify-center'>
      <Button
        onClick={onContractLength}
        variant='outline'
        disabled={isLoading}
        title='Contract snippet length'
      >
        -
      </Button>
      <Button
        onClick={onExpandLength}
        variant='outline'
        disabled={isLoading}
        title='Expand snippet length'
      >
        +
      </Button>
    </div>
    <div className='flex flex-row gap-2 justify-center'>
      <Button
        onClick={onReset}
        variant='destructive'
        disabled={!indexHasChanged || isLoading}
      >
        <Undo2Icon />
      </Button>
      <Button
        variant='outline'
        disabled={!indexHasChanged || isLoading}
        onClick={onUpdateSnippet}
        className={clsx(
          indexHasChanged ? 'animate-pulse bg-amber-300' : 'opacity-25',
        )}
      >
        <SaveIcon />
      </Button>
    </div>
  </div>
);

export default SnippetReviewBoundaryToggles;
