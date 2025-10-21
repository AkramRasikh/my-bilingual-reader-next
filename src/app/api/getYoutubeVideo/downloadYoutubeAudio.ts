import { execa } from 'execa';

export const downloadYoutubeAudio = async ({ outTemplate, url }) => {
  await execa(
    'yt-dlp',
    [
      '-x', // extract audio
      '--audio-format',
      'mp3', // convert to mp3
      '-o',
      outTemplate,
      url,
    ],
    { stdout: 'pipe', stderr: 'pipe' },
  );
};
