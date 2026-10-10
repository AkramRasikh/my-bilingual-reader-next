import {
  getCurrentTimeRangePhase,
  getSnippetTimeRange,
} from './learning-screen-review-time-range';

export type ReviewedSnippetCoverageInput = {
  id: string;
  time: number;
  isContracted?: boolean;
  reviewData?: unknown;
};

export type ReviewedSnippetCoverageBar = {
  id: string;
  lane: number;
};

export type ReviewedSnippetCoverageLayout = {
  bars: ReviewedSnippetCoverageBar[];
  laneCount: number;
};

export function layoutReviewedSnippetCoverage(
  snippets: ReviewedSnippetCoverageInput[],
  currentTime: number,
): ReviewedSnippetCoverageLayout {
  if (!Number.isFinite(currentTime)) {
    return { bars: [], laneCount: 0 };
  }

  const covering = snippets.flatMap((snippet) => {
    if (!snippet.reviewData || !Number.isFinite(snippet.time)) {
      return [];
    }

    const { startTime, endTime } = getSnippetTimeRange(snippet);
    const phase = getCurrentTimeRangePhase(currentTime, startTime, endTime);
    if (phase !== 'during') {
      return [];
    }

    return [
      {
        id: snippet.id,
        startTime,
      },
    ];
  });

  covering.sort(
    (a, b) => a.startTime - b.startTime || a.id.localeCompare(b.id),
  );

  const bars = covering.map((item, lane) => ({
    id: item.id,
    lane,
  }));

  return { bars, laneCount: bars.length };
}
