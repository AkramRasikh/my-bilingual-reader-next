import { execa } from 'execa';

export const downloadTargetLangSubs = async ({ outputTemplate, url }) =>
  await execa('yt-dlp', [
    '--write-subs',
    '--sub-langs',
    'ja',
    '--skip-download',
    '--convert-subs',
    'srt',
    '-o',
    outputTemplate,
    url,
  ]);
