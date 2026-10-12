import { execa } from 'execa';
import { isYoutubeFormatId } from './youtubeFormats';

const ytDlpErrorMessage = (err: unknown) => {
  const stderr =
    err && typeof err === 'object' && 'stderr' in err
      ? String(err.stderr ?? '')
      : '';
  const trimmed = stderr.trim();
  if (trimmed) return trimmed.slice(-800);
  return err instanceof Error ? err.message : 'Video download failed';
};

export const downloadYoutubeVideo = async ({
  outTemplate,
  url,
  videoFormatId,
  audioFormatId,
}: {
  outTemplate: string;
  url: string;
  videoFormatId?: string;
  audioFormatId?: string;
}) => {
  if (videoFormatId || audioFormatId) {
    if (
      !isYoutubeFormatId(videoFormatId) ||
      !isYoutubeFormatId(audioFormatId)
    ) {
      throw new Error('Invalid video or audio format id');
    }

    try {
      await execa(
        'yt-dlp',
        [
          '-f',
          `${videoFormatId}+${audioFormatId}`,
          '--merge-output-format',
          'mp4',
          '-o',
          outTemplate,
          url,
        ],
        { stdout: 'pipe', stderr: 'pipe' },
      );
    } catch (err) {
      throw new Error(ytDlpErrorMessage(err));
    }
    return true;
  }

  try {
    await execa('yt-dlp', ['-f', '136+140', '-o', outTemplate, url], {
      stdio: 'inherit',
    });
    return true;
  } catch (err) {
    console.error('Failed with 136+140:', err);
    try {
      await execa('yt-dlp', ['-f', '18+18', '-o', outTemplate, url], {
        stdio: 'inherit',
      });
      return true;
    } catch (err2) {
      console.error('## Failed with 18+18:', err2);
      return false;
    }
  }
};
