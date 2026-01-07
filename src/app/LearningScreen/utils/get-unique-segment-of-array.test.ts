import { describe, it, expect } from '@jest/globals';
import { getUniqueSegmentOfArray } from './get-unique-segment-of-array';

describe('getUniqueSegmentOfArray', () => {
  it('should return unique sentence IDs for a simple time range', () => {
    // Simulating a 10-second video where:
    // Seconds 0-3: sentence-1
    // Seconds 4-7: sentence-2
    // Seconds 8-9: sentence-3
    const secondsArray = [
      'sentence-1', // 0
      'sentence-1', // 1
      'sentence-1', // 2
      'sentence-1', // 3
      'sentence-2', // 4
      'sentence-2', // 5
      'sentence-2', // 6
      'sentence-2', // 7
      'sentence-3', // 8
      'sentence-3', // 9
    ];

    const result = getUniqueSegmentOfArray(secondsArray, 2, 6);

    // From second 2 (floor) to second 6 (ceil)
    // Should capture: sentence-1 (at index 2-3) and sentence-2 (at index 4-6)
    expect(result).toEqual(['sentence-1', 'sentence-2']);
  });

  it('should handle when same sentence spans entire range', () => {
    // All seconds map to the same sentence
    const secondsArray = [
      'sentence-1',
      'sentence-1',
      'sentence-1',
      'sentence-1',
      'sentence-1',
    ];

    const result = getUniqueSegmentOfArray(secondsArray, 1, 4);

    // Even though multiple seconds, only one unique sentence ID
    expect(result).toEqual(['sentence-1']);
  });

  it('should handle fractional times by using floor/ceil', () => {
    const secondsArray = [
      'sentence-1', // 0
      'sentence-1', // 1
      'sentence-2', // 2
      'sentence-2', // 3
      'sentence-3', // 4
      'sentence-3', // 5
    ];

    // Start at 1.7 (floor = 1) and end at 4.3 (ceil = 5)
    const result = getUniqueSegmentOfArray(secondsArray, 1.7, 4.3);

    // Should get sentence IDs from index 1 to 5
    expect(result).toEqual(['sentence-1', 'sentence-2', 'sentence-3']);
  });

  it('should handle single second range', () => {
    const secondsArray = [
      'sentence-1',
      'sentence-2',
      'sentence-3',
      'sentence-4',
    ];

    // Both floor(2) and ceil(2) = 2, so just one second
    const result = getUniqueSegmentOfArray(secondsArray, 2, 2);

    expect(result).toEqual(['sentence-3']);
  });

  it('should handle large transcript with many duplicate sentence IDs', () => {
    // Simulating a longer video (30 seconds) with sentences spanning multiple seconds
    const secondsArray = Array(30)
      .fill('')
      .map((_, i) => {
        if (i < 10) return 'sentence-1';
        if (i < 20) return 'sentence-2';
        return 'sentence-3';
      });

    const result = getUniqueSegmentOfArray(secondsArray, 5, 25);

    // Should capture all three sentences, but only once each
    expect(result).toEqual(['sentence-1', 'sentence-2', 'sentence-3']);
  });

  it('should get correct segment from middle of long array', () => {
    // Simulating a 300+ second video
    const secondsArray = Array(350)
      .fill('')
      .map((_, i) => {
        // Each sentence lasts ~10 seconds
        return `sentence-${Math.floor(i / 10)}`;
      });

    // Get segment from second 95 to 135 (should span ~4 sentences)
    const result = getUniqueSegmentOfArray(secondsArray, 95, 135);

    // Second 95 = sentence-9, second 135 = sentence-13
    expect(result).toEqual([
      'sentence-9',
      'sentence-10',
      'sentence-11',
      'sentence-12',
      'sentence-13',
    ]);
  });

  it('should handle edge case at start of array', () => {
    const secondsArray = [
      'sentence-1',
      'sentence-1',
      'sentence-2',
      'sentence-2',
      'sentence-3',
    ];

    const result = getUniqueSegmentOfArray(secondsArray, 0, 2);

    expect(result).toEqual(['sentence-1', 'sentence-2']);
  });

  it('should handle edge case at end of array', () => {
    const secondsArray = [
      'sentence-1',
      'sentence-2',
      'sentence-3',
      'sentence-3',
      'sentence-4',
    ];

    const result = getUniqueSegmentOfArray(secondsArray, 2, 4);

    expect(result).toEqual(['sentence-3', 'sentence-4']);
  });

  it('should efficiently reduce 300+ array to small unique segment', () => {
    // This demonstrates the performance benefit: instead of mapping 300+ items,
    // we slice to just the relevant portion first
    const secondsArray = Array(350)
      .fill('')
      .map((_, i) => {
        // Sentences last 5 seconds each
        return `sentence-${Math.floor(i / 5)}`;
      });

    // User is viewing a 10-second loop from second 100 to 110
    const result = getUniqueSegmentOfArray(secondsArray, 100, 110);

    // Instead of processing all 350 items, we only get the unique IDs in this range
    expect(result.length).toBeLessThan(5); // Much smaller than 350
    expect(result).toEqual(['sentence-20', 'sentence-21', 'sentence-22']);
  });

  it('should handle array with only one element', () => {
    // Edge case: video is only 1 second long
    const secondsArray = ['sentence-1'];

    const result = getUniqueSegmentOfArray(secondsArray, 0, 0);

    expect(result).toEqual(['sentence-1']);
  });
});
