import { mapSentenceIdsToSeconds } from './map-sentence-ids-to-seconds';

describe('mapSentenceIdsToSeconds', () => {
  it('should map transcript items to seconds array', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 5 },
      { id: 'id3', time: 10 },
    ];
    const duration = 15;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(15);
    expect(result.slice(0, 5)).toEqual(['id1', 'id1', 'id1', 'id1', 'id1']);
    expect(result.slice(5, 10)).toEqual(['id2', 'id2', 'id2', 'id2', 'id2']);
    expect(result.slice(10, 15)).toEqual(['id3', 'id3', 'id3', 'id3', 'id3']);
  });

  it('should handle duration with decimals by rounding up', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 5 },
    ];
    const duration = 8.3;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(9); // Math.ceil(8.3) = 9
    expect(result.slice(0, 5)).toEqual(['id1', 'id1', 'id1', 'id1', 'id1']);
    expect(result.slice(5, 9)).toEqual(['id2', 'id2', 'id2', 'id2']);
  });

  it('should handle single transcript item', () => {
    const content = [{ id: 'only-id', time: 0 }];
    const duration = 10;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(10);
    expect(result.every((id) => id === 'only-id')).toBe(true);
  });

  it('should handle transcript items with gaps', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 3 },
      { id: 'id3', time: 8 },
    ];
    const duration = 12;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(12);
    expect(result.slice(0, 3)).toEqual(['id1', 'id1', 'id1']);
    expect(result.slice(3, 8)).toEqual(['id2', 'id2', 'id2', 'id2', 'id2']);
    expect(result.slice(8, 12)).toEqual(['id3', 'id3', 'id3', 'id3']);
  });

  it('should handle transcript starting at non-zero time', () => {
    const content = [
      { id: 'id1', time: 2 },
      { id: 'id2', time: 5 },
    ];
    const duration = 10;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(10);
    expect(result[0]).toBeUndefined();
    expect(result[1]).toBeUndefined();
    expect(result.slice(2, 5)).toEqual(['id1', 'id1', 'id1']);
    expect(result.slice(5, 10)).toEqual(['id2', 'id2', 'id2', 'id2', 'id2']);
  });

  it('should handle empty content array', () => {
    const content: Array<{ id: string; time: number }> = [];
    const duration = 5;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(5);
    expect(result.every((item) => item === undefined)).toBe(true);
  });

  it('should handle exact duration match with last item time', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 5 },
      { id: 'id3', time: 10 },
    ];
    const duration = 10;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(10);
    expect(result.slice(0, 5)).toEqual(['id1', 'id1', 'id1', 'id1', 'id1']);
    expect(result.slice(5, 10)).toEqual(['id2', 'id2', 'id2', 'id2', 'id2']);
  });

  it('should handle very short durations', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 1 },
    ];
    const duration = 2.1;

    const result = mapSentenceIdsToSeconds({ content, duration });

    expect(result).toHaveLength(3); // Math.ceil(2.1) = 3
    expect(result[0]).toBe('id1');
    expect(result[1]).toBe('id2');
    expect(result[2]).toBe('id2');
  });

  it('should handle items with same start time (edge case)', () => {
    const content = [
      { id: 'id1', time: 0 },
      { id: 'id2', time: 0 }, // Same time as id1
      { id: 'id3', time: 5 },
    ];
    const duration = 10;

    const result = mapSentenceIdsToSeconds({ content, duration });

    // Since id2 starts at same time as id1, it will overwrite for second 0
    // then fill 0-5 range (but id1 already filled 0-0, so id2 overwrites nothing)
    expect(result).toHaveLength(10);
    // The behavior here depends on implementation - first item wins or last item wins
    expect(result[0]).toBeDefined();
  });

  it('should return empty array for invalid durations', () => {
    const content = [{ id: 'id1', time: 0 }];

    expect(mapSentenceIdsToSeconds({ content, duration: 0 })).toEqual([]);
    expect(mapSentenceIdsToSeconds({ content, duration: -5 })).toEqual([]);
    expect(mapSentenceIdsToSeconds({ content, duration: NaN })).toEqual([]);
    expect(mapSentenceIdsToSeconds({ content, duration: Infinity })).toEqual([]);
  });
});
