import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';
import { LucideHammer } from 'lucide-react';

interface TranscriptItemSecondaryLoadingIndicatorsProps {
  isBreakdownSentenceLoadingState: boolean;
  isLoadingState: boolean;
  contentItemId: string;
}

const TranscriptItemSecondaryLoadingIndicators = ({
  isBreakdownSentenceLoadingState,
  isLoadingState,
  contentItemId,
}: TranscriptItemSecondaryLoadingIndicatorsProps) => {
  return (
    <div className='flex flex-col gap-3 mt-2'>
      <div
        className={clsx(
          'animate-pulse inset-0 flex items-center justify-center rounded',
          !isBreakdownSentenceLoadingState && 'invisible',
        )}
        data-testid={`transcript-breakdown-loading-${contentItemId}`}
      >
        <LucideHammer
          color='brown'
          className='animate-bounce mx-auto fill-amber-700 rounded-4xl'
          size={16}
        />
      </div>

      <div
        className={clsx(
          'inset-0 flex items-center justify-center rounded',
          !isLoadingState && 'invisible',
        )}
      >
        <LoadingSpinner />
      </div>
    </div>
  );
};

export default TranscriptItemSecondaryLoadingIndicators;
