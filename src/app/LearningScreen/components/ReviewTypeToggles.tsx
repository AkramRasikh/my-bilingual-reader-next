import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ReviewTypeTogglesProps {
  enableWordReviewState?: boolean;
  setEnableWordReviewState?: (value: boolean) => void;
  enableTranscriptReviewState?: boolean;
  setEnableTranscriptReviewState?: (value: boolean) => void;
  enableSnippetReviewState?: boolean;
  setEnableSnippetReviewState?: (value: boolean) => void;
  wordsCount?: number;
  sentencesCount?: number;
  snippetsCount?: number;
  reviewIntervalState?: number;
  setReviewIntervalState?: (value: number) => void;
  isInReviewMode?: boolean;
  setIsInReviewMode?: (value: boolean) => void;
}

const ReviewTypeToggles = ({
  enableWordReviewState = false,
  setEnableWordReviewState = () => {},
  enableTranscriptReviewState = false,
  setEnableTranscriptReviewState = () => {},
  enableSnippetReviewState = false,
  setEnableSnippetReviewState = () => {},
  wordsCount = 0,
  sentencesCount = 0,
  snippetsCount = 0,
  reviewIntervalState = 30,
  setReviewIntervalState = () => {},
  isInReviewMode = false,
  setIsInReviewMode = () => {},
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

  // When not in review mode, hardcode counts to 0 and disable checkboxes
  const displayWordsCount = isInReviewMode ? wordsCount : 0;
  const displaySentencesCount = isInReviewMode ? sentencesCount : 0;
  const displaySnippetsCount = isInReviewMode ? snippetsCount : 0;
  const checkboxesDisabled = !isInReviewMode;

  return (
    <div className='flex justify-around items-center my-1'>
      <div className='p-1 flex justify-center gap-4'>
        <div className='flex gap-2 my-auto'>
          <Label data-testid='review-label'>Review</Label>
          <Switch
            checked={isInReviewMode}
            onCheckedChange={setIsInReviewMode}
            data-testid='review-switch'
          />
        </div>
      </div>
      <div className='flex items-center justify-center gap-6 my-auto'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='words-toggle'
            checked={checkboxesDisabled ? false : enableWordReviewState}
            onCheckedChange={setEnableWordReviewState}
            disabled={checkboxesDisabled}
          />
          <Label
            htmlFor='words-toggle'
            className='text-sm font-medium cursor-pointer'
          >
            🔤 ({displayWordsCount})
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='sentences-toggle'
            checked={checkboxesDisabled ? false : enableTranscriptReviewState}
            onCheckedChange={setEnableTranscriptReviewState}
            disabled={checkboxesDisabled}
          />
          <Label
            htmlFor='sentences-toggle'
            className='text-sm font-medium cursor-pointer'
          >
            📝 ({displaySentencesCount})
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='snippets-toggle'
            checked={checkboxesDisabled ? false : enableSnippetReviewState}
            onCheckedChange={setEnableSnippetReviewState}
            disabled={checkboxesDisabled}
          />
          <Label
            htmlFor='snippets-toggle'
            className='text-sm font-medium cursor-pointer'
          >
            ✂️ ({displaySnippetsCount})
          </Label>
        </div>
        <div className='flex items-center gap-2 border rounded-md px-2 py-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleDecrement}
            disabled={!isInReviewMode || reviewIntervalState <= 30}
            data-testid='review-interval-decrement'
          >
            <Minus className='h-3 w-3' />
          </Button>
          <span
            className='text-sm font-medium min-w-12 text-center'
            data-testid='review-interval-count'
          >
            {reviewIntervalState}s
          </span>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleIncrement}
            disabled={!isInReviewMode || reviewIntervalState >= 210}
            data-testid='review-interval-increment'
          >
            <Plus className='h-3 w-3' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewTypeToggles;
