import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface ReviewTypeTogglesProps {
  enableWordReviewState: boolean;
  setEnableWordReviewState: (value: boolean) => void;
  enableTranscriptReviewState: boolean;
  setEnableTranscriptReviewState: (value: boolean) => void;
  enableSnippetReviewState: boolean;
  setEnableSnippetReviewState: (value: boolean) => void;
  wordsCount: number;
  sentencesCount: number;
  snippetsCount: number;
  reviewIntervalState: number;
  setReviewIntervalState: (value: number) => void;
}

const ReviewTypeToggles = ({
  enableWordReviewState,
  setEnableWordReviewState,
  enableTranscriptReviewState,
  setEnableTranscriptReviewState,
  enableSnippetReviewState,
  setEnableSnippetReviewState,
  wordsCount,
  sentencesCount,
  snippetsCount,
  reviewIntervalState,
  setReviewIntervalState,
}: ReviewTypeTogglesProps) => {
  const handleDecrement = () => {
    if (reviewIntervalState > 30) {
      setReviewIntervalState(reviewIntervalState - 30);
    }
  };

  const handleIncrement = () => {
    if (reviewIntervalState < 210) {
      setReviewIntervalState(reviewIntervalState + 30);
    }
  };

  return (
    <div className='flex items-center justify-center gap-6 mb-4'>
      <div className='flex items-center gap-2'>
        <Checkbox
          id='words-toggle'
          checked={enableWordReviewState}
          onCheckedChange={setEnableWordReviewState}
        />
        <Label
          htmlFor='words-toggle'
          className='text-sm font-medium cursor-pointer'
        >
          Words ({wordsCount})
        </Label>
      </div>
      <div className='flex items-center gap-2'>
        <Checkbox
          id='sentences-toggle'
          checked={enableTranscriptReviewState}
          onCheckedChange={setEnableTranscriptReviewState}
        />
        <Label
          htmlFor='sentences-toggle'
          className='text-sm font-medium cursor-pointer'
        >
          Sentences ({sentencesCount})
        </Label>
      </div>
      <div className='flex items-center gap-2'>
        <Checkbox
          id='snippets-toggle'
          checked={enableSnippetReviewState}
          onCheckedChange={setEnableSnippetReviewState}
        />
        <Label
          htmlFor='snippets-toggle'
          className='text-sm font-medium cursor-pointer'
        >
          Snippets ({snippetsCount})
        </Label>
      </div>
      <div className='flex items-center gap-2 border rounded-md px-2 py-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={handleDecrement}
          disabled={reviewIntervalState <= 30}
        >
          <Minus className='h-3 w-3' />
        </Button>
        <span className='text-sm font-medium min-w-12 text-center'>
          {reviewIntervalState}s
        </span>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={handleIncrement}
          disabled={reviewIntervalState >= 210}
        >
          <Plus className='h-3 w-3' />
        </Button>
      </div>
    </div>
  );
};

export default ReviewTypeToggles;
