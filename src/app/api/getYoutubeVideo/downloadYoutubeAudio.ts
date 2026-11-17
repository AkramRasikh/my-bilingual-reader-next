import { execa } from 'execa';
import {isYoutubeFormatId} from './youtubeFormats';

export const downloadYoutubeAudio = async ({ outTemplate, url, audioFormatId }: {outTemplate: string; url: string; audioFormatId?: string}) => {
  if (audioFormatId !== undefined && !isYoutubeFormatId(audioFormatId)) throw new Error('Invalid audio format ID');
  await execa(
    'yt-dlp',
    [
      ...(audioFormatId ? ['-f', audioFormatId] : []),
      '--no-playlist',
      '-x', // extract audio
      '--audio-format',
      'mp3', // convert to mp3
      ...(!audioFormatId ? ['--extractor-args', 'youtube:player_client=android'] : []),
      '-o',
      outTemplate,
      url,
    ],
    { stdout: 'pipe', stderr: 'pipe' },
  );
};
