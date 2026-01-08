import { OverlappingSnippetData } from '../../types/shared-types';

export function accumulateSentenceOverlap(snippetsBySentence: OverlappingSnippetData[]) {
  const sentenceMap: Record<string, [number, number][]> = {};

  for (const snip of snippetsBySentence) {
    const { id, percentageOverlap, startPoint } = snip;

    const start = Math.max(0, startPoint);
    const end = Math.min(100, startPoint + percentageOverlap);

    if (!sentenceMap[id]) sentenceMap[id] = [];
    sentenceMap[id].push([start, end]);
  }

  // Merge intervals for each sentence
  const results: Record<string, { mergedRanges: [number, number][]; totalOverlap: number }> = {};

  for (const [sentenceId, intervals] of Object.entries(sentenceMap)) {
    // Sort by start position
    intervals.sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    let [currStart, currEnd] = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      const [nextStart, nextEnd] = intervals[i];

      if (nextStart <= currEnd) {
        // Overlapping → extend
        currEnd = Math.max(currEnd, nextEnd);
      } else {
        // No overlap → push previous
        merged.push([currStart, currEnd]);
        [currStart, currEnd] = [nextStart, nextEnd];
      }
    }
    merged.push([currStart, currEnd]);

    // Total coverage
    const total = merged.reduce((sum, [s, e]) => sum + (e - s), 0);

    if (total > 50) {
      results[sentenceId] = {
        mergedRanges: merged,
        totalOverlap: total, // in %
      };
    }
  }

  return results;
}
