import { isYoutubeFormatId, mapYoutubeFormats } from '../youtubeFormats';

describe('mapYoutubeFormats', () => {
  it('keeps video, audio, and combined formats and drops storyboards', () => {
    const formats = mapYoutubeFormats([
      {
        format_id: 'sb0',
        ext: 'mhtml',
        vcodec: 'images',
        acodec: 'none',
      },
      {
        format_id: '140',
        ext: 'm4a',
        resolution: 'audio only',
        vcodec: 'none',
        acodec: 'mp4a.40.2',
        format_note: 'medium',
        filesize: 1024,
      },
      {
        format_id: '136',
        ext: 'mp4',
        resolution: '1280x720',
        fps: 30,
        vcodec: 'avc1.4d401f',
        acodec: 'none',
        filesize_approx: 2048,
        format_note: '720p',
      },
      {
        format_id: '18',
        ext: 'mp4',
        resolution: '640x360',
        fps: 30,
        vcodec: 'avc1.42001E',
        acodec: 'mp4a.40.2',
        format_note: '360p',
      },
    ]);

    expect(formats.map((format) => format.id)).toEqual(['140', '136', '18']);
    expect(formats.map((format) => format.kind)).toEqual([
      'audio',
      'video',
      'both',
    ]);
    expect(formats[1].filesize).toBe(2048);
    expect(formats[1].vcodec).toBe('avc1.4d401f');
    expect(formats[0].acodec).toBe('mp4a.40.2');
  });
});

describe('isYoutubeFormatId', () => {
  it('accepts a single format id and rejects a merged selector', () => {
    expect(isYoutubeFormatId('136')).toBe(true);
    expect(isYoutubeFormatId('140-drc')).toBe(true);
    expect(isYoutubeFormatId('136+140')).toBe(false);
    expect(isYoutubeFormatId('best')).toBe(true);
    expect(isYoutubeFormatId('-f')).toBe(false);
    expect(isYoutubeFormatId('')).toBe(false);
  });
});
