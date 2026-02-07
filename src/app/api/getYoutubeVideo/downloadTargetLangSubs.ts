import { execa } from 'execa';

export const downloadTargetLangSubs = async ({
  outputTemplate,
  url,
  googleLangCode,
}) => {
  const subLangs =
    googleLangCode === 'zh'
      ? 'zh,zh-Hans,zh-Hant,zh-TW,zh-HK,zh-CN'
      : googleLangCode;

  return await execa('yt-dlp', [
    '--write-subs',
    '--sub-langs',
    subLangs,
    '--skip-download',
    '--convert-subs',
    'srt',
    '-o',
    outputTemplate,
    url,
  ]);
};
