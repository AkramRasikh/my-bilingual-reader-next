import { execa } from 'execa';
import { mapYoutubeFormats } from './youtubeFormats';

export const listYoutubeFormats = async (url: string) => {
  const { stdout } = await execa(
    'yt-dlp',
    ['-J', '--skip-download', '--no-warnings', '--no-playlist', url],
    {
      stdout: 'pipe',
      stderr: 'pipe',
      maxBuffer: 50 * 1024 * 1024,
    },
  );

  const data = JSON.parse(stdout);
  return mapYoutubeFormats(data.formats ?? []);
};
