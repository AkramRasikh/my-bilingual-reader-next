'use client';

import { useReviewedSnippetCoverage } from './useReviewedSnippetCoverage';

const LearningScreenSnippetCoverageDot = () => {
  const layout = useReviewedSnippetCoverage();

  if (layout.laneCount === 0) {
    return null;
  }

  return (
    <div
      data-testid='snippet-coverage-dot'
      aria-hidden
      className='pointer-events-none absolute top-2 left-2 z-10 size-[10px] rounded-full bg-yellow-300 shadow-[0_0_8px_2px_rgba(253,224,71,0.95)]'
    />
  );
};

export default LearningScreenSnippetCoverageDot;
