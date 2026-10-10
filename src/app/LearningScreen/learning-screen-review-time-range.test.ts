import { describe, expect, it } from '@jest/globals';
import {
  getCurrentTimeRangePhase,
  getSentenceTimeRange,
  getSnippetTimeRange,
  getTimeRangeProgress,
  isCurrentTimeBeyondRange,
} from './learning-screen-review-time-range';

describe('getSnippetTimeRange', () => {
  it('uses 1.5s padding by default', () => {
    expect(getSnippetTimeRange({ time: 10, isContracted: false })).toEqual({
      startTime: 8.5,
      endTime: 11.5,
    });
  });

  it('uses 0.75s padding when contracted', () => {
    expect(getSnippetTimeRange({ time: 10, isContracted: true })).toEqual({
      startTime: 9.25,
      endTime: 10.75,
    });
  });
});

describe('getSentenceTimeRange', () => {
  it('ends at nextSentence when available', () => {
    expect(
      getSentenceTimeRange({ time: 5, nextSentence: 12 }, 100),
    ).toEqual({
      startTime: 5,
      endTime: 12,
    });
  });

  it('falls back to media duration when nextSentence is null', () => {
    expect(
      getSentenceTimeRange({ time: 5, nextSentence: null }, 42),
    ).toEqual({
      startTime: 5,
      endTime: 42,
    });
  });
});

describe('getCurrentTimeRangePhase', () => {
  it('returns before when currentTime is before start', () => {
    expect(getCurrentTimeRangePhase(8, 8.5, 11.5)).toBe('before');
  });

  it('returns during when currentTime is within the range', () => {
    expect(getCurrentTimeRangePhase(10, 8.5, 11.5)).toBe('during');
    expect(getCurrentTimeRangePhase(8.5, 8.5, 11.5)).toBe('during');
    expect(getCurrentTimeRangePhase(11.5, 8.5, 11.5)).toBe('during');
  });

  it('returns beyond when currentTime is past end', () => {
    expect(getCurrentTimeRangePhase(12, 8.5, 11.5)).toBe('beyond');
  });

  it('returns null when neither bound is finite', () => {
    expect(getCurrentTimeRangePhase(10, null, null)).toBe(null);
  });

  it('returns during when only start is known and playback has reached it', () => {
    expect(getCurrentTimeRangePhase(10, 8.5, null)).toBe('during');
  });

  it('returns before when only start is known and playback is earlier', () => {
    expect(getCurrentTimeRangePhase(7, 8.5, null)).toBe('before');
  });
});

describe('getTimeRangeProgress', () => {
  it('stays empty before the range and full after it', () => {
    expect(getTimeRangeProgress(8, 10, 12)).toBe(0);
    expect(getTimeRangeProgress(10, 10, 12)).toBe(0);
    expect(getTimeRangeProgress(13, 10, 12)).toBe(1);
    expect(getTimeRangeProgress(12, 10, 12)).toBe(1);
  });

  it('returns the fraction of the range that has played', () => {
    expect(getTimeRangeProgress(11, 10, 12)).toBeCloseTo(0.5);
  });

  it('returns 0 when the end is unknown', () => {
    expect(getTimeRangeProgress(11, 10, null)).toBe(0);
  });

  it('treats a zero-length range that playback has passed as complete', () => {
    expect(getTimeRangeProgress(11, 10, 10)).toBe(1);
  });
});

describe('isCurrentTimeBeyondRange', () => {
  it('returns true when currentTime is past end', () => {
    expect(isCurrentTimeBeyondRange(12, 11.5)).toBe(true);
  });

  it('returns false when currentTime is within or at end', () => {
    expect(isCurrentTimeBeyondRange(11.5, 11.5)).toBe(false);
    expect(isCurrentTimeBeyondRange(10, 11.5)).toBe(false);
  });

  it('returns false when end is not finite', () => {
    expect(isCurrentTimeBeyondRange(10, null)).toBe(false);
    expect(isCurrentTimeBeyondRange(10, undefined)).toBe(false);
  });
});
