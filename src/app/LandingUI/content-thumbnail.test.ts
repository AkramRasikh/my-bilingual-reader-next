import { describe, expect, it } from '@jest/globals';
import {
  getContentOrigin,
  getContentThumbnailUrl,
  getFallbackThumbnailGradient,
  getNetflixWatchUrl,
} from './content-thumbnail';

describe('getContentThumbnailUrl', () => {
  it('builds a YouTube thumbnail from a watch URL', () => {
    expect(
      getContentThumbnailUrl({
        origin: 'youtube',
        url: 'https://www.youtube.com/watch?v=abc123&t=10',
      }),
    ).toBe('https://img.youtube.com/vi/abc123/hqdefault.jpg');
  });

  it('treats missing origin as YouTube', () => {
    expect(
      getContentThumbnailUrl({ url: 'https://youtu.be/xyz789' }),
    ).toBe('https://img.youtube.com/vi/xyz789/hqdefault.jpg');
  });

  it('returns null for Netflix content', () => {
    expect(
      getContentThumbnailUrl({
        origin: 'netflix',
        url: 'https://www.netflix.com/watch/81234567',
      }),
    ).toBeNull();
  });

  it('returns null when the URL has no video id', () => {
    expect(getContentThumbnailUrl({ origin: 'youtube', url: '' })).toBeNull();
    expect(
      getContentThumbnailUrl({ origin: 'youtube', url: 'not a url' }),
    ).toBeNull();
  });
});

describe('getContentOrigin', () => {
  it('defaults unknown origins to youtube', () => {
    expect(getContentOrigin('netflix')).toBe('netflix');
    expect(getContentOrigin(undefined)).toBe('youtube');
    expect(getContentOrigin('other')).toBe('youtube');
  });
});

describe('getFallbackThumbnailGradient', () => {
  it('is stable for the same seed', () => {
    expect(getFallbackThumbnailGradient('Some title')).toBe(
      getFallbackThumbnailGradient('Some title'),
    );
  });
});

describe('getNetflixWatchUrl', () => {
  it('uses the stored Netflix watch URL', () => {
    expect(
      getNetflixWatchUrl({
        origin: 'netflix',
        url: 'https://www.netflix.com/watch/81234567?trackId=1',
      }),
    ).toBe('https://www.netflix.com/watch/81234567');
  });

  it('falls back to the namespaced content id', () => {
    expect(
      getNetflixWatchUrl({ origin: 'netflix', url: '', id: 'netflix:81234567' }),
    ).toBe('https://www.netflix.com/watch/81234567');
  });

  it('returns null for non-Netflix content', () => {
    expect(
      getNetflixWatchUrl({
        origin: 'youtube',
        url: 'https://www.youtube.com/watch?v=abc',
      }),
    ).toBeNull();
  });
});
