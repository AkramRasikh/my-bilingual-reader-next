'use client';

import clsx from 'clsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useLearningScreen from './useLearningScreen';

const filters = [
  {
    id: 'closed-panel-words-toggle',
    label: 'Words in review',
    emoji: '🔤',
    countKey: 'words',
  },
  {
    id: 'closed-panel-sentences-toggle',
    label: 'Sentences in review',
    emoji: '📝',
    countKey: 'sentences',
  },
  {
    id: 'closed-panel-snippets-toggle',
    label: 'Snippets in review',
    emoji: '✂️',
    countKey: 'snippets',
  },
] as const;

const LearningScreenClosedPanelReviewFilters = () => {
  const {
    enableWordReviewState,
    setEnableWordReviewState,
    enableTranscriptReviewState,
    setEnableTranscriptReviewState,
    enableSnippetReviewState,
    setEnableSnippetReviewState,
    postWordsMemoized,
    postSentencesMemoized,
    postSnippetsMemoized,
    isInReviewMode,
  } = useLearningScreen();

  const counts = {
    words: postWordsMemoized.length,
    sentences: postSentencesMemoized.length,
    snippets: postSnippetsMemoized.length,
  };

  const checked = {
    words: enableWordReviewState,
    sentences: enableTranscriptReviewState,
    snippets: enableSnippetReviewState,
  };

  const setChecked = {
    words: setEnableWordReviewState,
    sentences: setEnableTranscriptReviewState,
    snippets: setEnableSnippetReviewState,
  };

  return (
    <div
      className='flex flex-col items-center gap-2'
      data-testid='closed-panel-review-filters'
    >
      <p
        data-testid='closed-panel-review-mode'
        data-review-mode={isInReviewMode ? 'on' : 'off'}
        aria-label={isInReviewMode ? 'Review mode on' : 'Review mode off'}
        className={clsx(
          'text-xs font-medium leading-none',
          isInReviewMode ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        📚 {isInReviewMode ? 'On' : 'Off'}
      </p>
      <div
        className={clsx(
          'flex flex-col items-start gap-2',
          isInReviewMode ? 'opacity-100' : 'opacity-40',
        )}
      >
        {filters.map((filter) => (
          <div key={filter.id} className='flex items-center gap-2'>
            <Checkbox
              id={filter.id}
              data-testid={filter.id}
              checked={checked[filter.countKey]}
              disabled={!isInReviewMode}
              onCheckedChange={(value) =>
                setChecked[filter.countKey](value === true)
              }
            />
            <Label
              htmlFor={filter.id}
              className={clsx(
                'text-xs font-medium',
                isInReviewMode ? 'cursor-pointer' : 'cursor-not-allowed',
              )}
            >
              {filter.emoji} ({counts[filter.countKey]})
              <span className='sr-only'> {filter.label}</span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningScreenClosedPanelReviewFilters;
