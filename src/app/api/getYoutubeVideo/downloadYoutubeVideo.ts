import { execa } from 'execa';

export const downloadYoutubeVideo = async ({ outTemplate, url }) => {
  await execa('yt-dlp', ['-f', '136+140', '-o', outTemplate, url], {
    stdio: 'inherit',
  });
};
