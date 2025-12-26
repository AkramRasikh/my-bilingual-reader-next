import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
}: ReviewTypeTogglesProps) => {
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
    </div>
  );
};

export default ReviewTypeToggles;
