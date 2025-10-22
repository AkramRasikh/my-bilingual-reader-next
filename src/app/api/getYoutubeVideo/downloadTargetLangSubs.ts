import { execa } from 'execa';

export const downloadTargetLangSubs = async ({
  outputTemplate,
  url,
  googleLangCode,
}) =>
  await execa('yt-dlp', [
    '--write-subs',
    '--sub-langs',
    googleLangCode,
    '--skip-download',
    '--convert-subs',
    'srt',
    '-o',
    outputTemplate,
    url,
  ]);
