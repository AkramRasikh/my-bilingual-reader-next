import { execa } from 'execa';

export const downloadYoutubeVideo = async ({
  outTemplate,
  url,
  skipError = false,
}) => {
  try {
    await execa('yt-dlp', ['-f', '136+140', '-o', outTemplate, url], {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('Failed with 136+140:', err);
    try {
      await execa('yt-dlp', ['-f', '135+140', '-o', outTemplate, url], {
        stdio: 'inherit',
      });
    } catch (err2) {
      console.error('## Failed with 135+140:', err2);
      if (!skipError) {
        throw err2;
      }
    }
  }
};
