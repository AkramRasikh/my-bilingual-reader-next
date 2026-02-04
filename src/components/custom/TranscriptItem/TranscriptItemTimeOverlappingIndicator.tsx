import { OverlappingSnippetData } from '@/app/types/shared-types';

interface TranscriptItemTimeOverlappingIndicatorProps {
  thisSnippetOverlapMemoized: OverlappingSnippetData;
}

const TranscriptItemTimeOverlappingIndicator = ({
  thisSnippetOverlapMemoized,
}: TranscriptItemTimeOverlappingIndicatorProps) => (
  <div className='relative h-1' data-testid='transcript-time-overlap-indicator'>
    <div
      className='absolute bg-red-500 opacity-50 rounded'
      style={{
        width: `${thisSnippetOverlapMemoized.percentageOverlap}%`,
        left: `${thisSnippetOverlapMemoized.startPoint}%`,
        height: '100%',
      }}
    />
  </div>
);

export default TranscriptItemTimeOverlappingIndicator;
