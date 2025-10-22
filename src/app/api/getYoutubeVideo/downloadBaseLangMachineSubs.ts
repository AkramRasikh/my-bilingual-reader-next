import { execa } from 'execa';

export const downloadBaseLangMachineSubs = async ({ outputTemplate, url }) =>
  await execa('yt-dlp', [
    '--write-auto-subs',
    '--sub-langs',
    'en',
    '--skip-download',
    '--convert-subs',
    'srt',
    '-o',
    outputTemplate,
    url,
  ]);

export const downloadBaseLangHumanSubs = async ({ outputTemplate, url }) =>
  await execa('yt-dlp', [
    '--write-subs',
    '--sub-langs',
    'en',
    '--skip-download',
    '--convert-subs',
    'srt',
    '-o',
    outputTemplate,
    url,
  ]);
