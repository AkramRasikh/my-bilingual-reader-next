import { describe, expect, it } from '@jest/globals';
import { layoutReviewedSnippetCoverage } from './snippet-coverage-lanes';

const review = { state: 0 };

describe('layoutReviewedSnippetCoverage', () => {
  it('drops snippets that have no review', () => {
    const layout = layoutReviewedSnippetCoverage(
      [
        { id: 'saved', time: 100 },
        { id: 'reviewed', time: 100, reviewData: review },
      ],
      100,
    );

    expect(layout.bars.map((bar) => bar.id)).toEqual(['reviewed']);
    expect(layout.laneCount).toBe(1);
  });

  it('hides snippets that do not cover the current time', () => {
    const layout = layoutReviewedSnippetCoverage(
      [
        { id: 'now', time: 100, reviewData: review },
        { id: 'later', time: 110, reviewData: review },
      ],
      100,
    );

    expect(layout.bars.map((bar) => bar.id)).toEqual(['now']);
  });

  it('includes the snippet at the start and end of its range', () => {
    const snippet = [{ id: 'edge', time: 10, reviewData: review }];

    expect(layoutReviewedSnippetCoverage(snippet, 8.5).bars).toHaveLength(1);
    expect(layoutReviewedSnippetCoverage(snippet, 11.5).bars).toHaveLength(1);
    expect(layoutReviewedSnippetCoverage(snippet, 8.49).bars).toHaveLength(0);
    expect(layoutReviewedSnippetCoverage(snippet, 11.51).bars).toHaveLength(0);
  });

  it('uses the shorter contracted range', () => {
    const snippet = [
      { id: 'short', time: 100, isContracted: true, reviewData: review },
    ];

    expect(layoutReviewedSnippetCoverage(snippet, 99.25).bars).toHaveLength(1);
    expect(layoutReviewedSnippetCoverage(snippet, 99.2).bars).toHaveLength(0);
  });

  it('stacks every reviewed snippet that covers the current time', () => {
    const layout = layoutReviewedSnippetCoverage(
      [
        { id: 'b', time: 101, reviewData: review },
        { id: 'a', time: 100, reviewData: review },
        { id: 'later', time: 120, reviewData: review },
      ],
      100.5,
    );

    expect(layout.bars.map((bar) => bar.id)).toEqual(['a', 'b']);
    expect(layout.bars.map((bar) => bar.lane)).toEqual([0, 1]);
    expect(layout.laneCount).toBe(2);
  });

  it('returns nothing when playback is outside every reviewed snippet', () => {
    const layout = layoutReviewedSnippetCoverage(
      [{ id: 'far', time: 200, reviewData: review }],
      100,
    );

    expect(layout.bars).toEqual([]);
    expect(layout.laneCount).toBe(0);
  });

});
