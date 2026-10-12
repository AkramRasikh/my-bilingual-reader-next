import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import os from 'os';
import { japanese, chinese, arabic, french } from '@/app/languages';
import squashSubtitles from './squashSubtitles';
import { downloadTargetLangSubs } from './downloadTargetLangSubs';
import { downloadBaseLangHumanSubs } from './downloadBaseLangMachineSubs';
import { downloadYoutubeAudio } from './downloadYoutubeAudio';
import { sanitizeFilename } from './santizeFilename';
import { downloadYoutubeVideo } from './downloadYoutubeVideo';
import { listYoutubeFormats } from './listYoutubeFormats';
import {
  isYoutubeFormatId,
  type YoutubeFormat,
} from './youtubeFormats';
import * as OpenCC from 'opencc-js';

const googleLanguagesKey = {
  [japanese]: 'ja',
  [chinese]: 'zh',
  [arabic]: 'ar',
  [french]: 'fr',
};

const pickChineseSubtitleFile = (files: string[]) => {
  const zhSrtFiles = files.filter((f) => f.includes('zh') && f.includes('srt'));
  const traditional = zhSrtFiles.find((f) => /zh-(TW|Hant|HK)/i.test(f));
  if (traditional) return traditional;

  const simplified = zhSrtFiles.find((f) => /zh-(Hans|CN)/i.test(f));
  if (simplified) return simplified;

  return zhSrtFiles[0];
};

const traditionalToSimplifiedTW = OpenCC.Converter({ from: 'tw', to: 'cn' });
const traditionalToSimplifiedHK = OpenCC.Converter({ from: 'hk', to: 'cn' });

const getTraditionalChineseConverter = (subtitleFile: string) =>
  /zh-(HK)/i.test(subtitleFile)
    ? traditionalToSimplifiedHK
    : traditionalToSimplifiedTW;

const youtubeAudioPath = path.join(process.cwd(), 'public', 'youtube');
const youtubeVideoPath = path.join(process.cwd(), 'public', 'youtube-video');

const findDownloadedFile = (dir: string, baseName: string) => {
  const files = fs.readdirSync(dir);
  return files.find((f) => f.startsWith(baseName + '.'));
};

export type YoutubeDownloadBody = {
  url?: string;
  title?: string;
  language?: string;
  retryVideoOnly?: boolean;
  videoFormatId?: string;
  audioFormatId?: string;
};

export type YoutubeDownloadResponse = {
  status: number;
  body: {
    error?: string;
    transcript?: unknown;
    publicUrl?: string;
    publicVideoUrl?: string | null;
    formatSelectionRequired?: boolean;
    formats?: YoutubeFormat[];
    formatListError?: string;
  };
};

const retryVideoDownload = async ({
  url,
  title,
  videoFormatId,
  audioFormatId,
}: YoutubeDownloadBody): Promise<YoutubeDownloadResponse> => {
  if (!url || !title || !videoFormatId || !audioFormatId) {
    return {
      status: 400,
      body: {
        error: 'Missing either: url, title, videoFormatId or audioFormatId',
      },
    };
  }

  if (!isYoutubeFormatId(videoFormatId) || !isYoutubeFormatId(audioFormatId)) {
    return {
      status: 400,
      body: { error: 'Invalid video or audio format id' },
    };
  }

  const baseName = sanitizeFilename(String(title));
  const videoOutputPath = path.join(youtubeVideoPath, `${baseName}.%(ext)s`);

  try {
    await downloadYoutubeVideo({
      outTemplate: videoOutputPath,
      url,
      videoFormatId,
      audioFormatId,
    });
  } catch (error) {
    return {
      status: 500,
      body: { error: error instanceof Error ? error.message : 'Video download failed' },
    };
  }

  const file = findDownloadedFile(youtubeVideoPath, baseName);
  if (!file) {
    return {
      status: 500,
      body: { error: 'Video download finished but file not found.' },
    };
  }

  return {
    status: 200,
    body: {
      publicVideoUrl: `/youtube-video/${encodeURIComponent(file)}`,
      formatSelectionRequired: false,
    },
  };
};

export async function runYoutubeDownload(
  input: YoutubeDownloadBody,
): Promise<YoutubeDownloadResponse> {
  const { url, title, language, retryVideoOnly } = input;

  if (retryVideoOnly) {
    return retryVideoDownload(input);
  }

  console.log('## ', {
    url,
    title,
    language,
  });

  if (!url || !title || !language) {
    return {
      status: 400,
      body: { error: 'Missing either: url, title or language' },
    };
  }

  // Step 1: Try downloading human-generated English subs
  const tmpDir = await fsPromise.mkdtemp(path.join(os.tmpdir(), 'yt-'));
  const outputTemplate = path.join(tmpDir, 'video');

  const googleLangCode = googleLanguagesKey[language] as string;
  try {
    await downloadTargetLangSubs({ outputTemplate, url, googleLangCode });
  } catch (error) {
    console.log('## Failed to get Japaneses subs');
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : 'Failed to get subtitles',
      },
    };
  }

  const targetLangFiles = await fsPromise.readdir(tmpDir);

  console.log('## targetLangFiles', targetLangFiles);

  const targetLangFilesFiltered =
    language === chinese
      ? pickChineseSubtitleFile(targetLangFiles)
      : language === arabic
        ? targetLangFiles.find((f) => f.endsWith('.ar.srt'))
        : language === french
          ? targetLangFiles.find((f) => f.endsWith('.fr.srt'))
          : targetLangFiles.find((f) => f.endsWith('.ja.srt'));

  const isTraditionalChineseSubtitle =
    language === chinese &&
    !!targetLangFilesFiltered &&
    /zh-(TW|Hant|HK)/i.test(targetLangFilesFiltered);

  if (!targetLangFilesFiltered) {
    return {
      status: 404,
      body: { error: `No ${language} subtitles found` },
    };
  }

  const baseName = sanitizeFilename(String(title));
  const audioOutputPath = path.join(youtubeAudioPath, `${baseName}.%(ext)s`);
  const videoOutputPath = path.join(youtubeVideoPath, `${baseName}.%(ext)s`);

  let videoDownloaded = false;
  try {
    await downloadYoutubeAudio({ outTemplate: audioOutputPath, url });
    videoDownloaded = await downloadYoutubeVideo({
      outTemplate: videoOutputPath,
      url,
    });
  } catch (error) {
    console.log('## failed to get audio ', error);
  }

  const file = findDownloadedFile(youtubeAudioPath, baseName);
  if (!file) {
    return {
      status: 500,
      body: { error: 'Download finished but file not found.' },
    };
  }

  const publicUrl = `/youtube/${encodeURIComponent(file)}`;
  const publicVideoUrl = `/youtube-video/${encodeURIComponent(file)}`;

  try {
    await downloadBaseLangHumanSubs({ outputTemplate, url });
  } catch (error) {
    console.log('## Failed to get English subs', error);
  }

  // Find the downloaded subtitle file
  const engFiles = await fsPromise.readdir(tmpDir);

  const engSrtFile = engFiles.find((f) => f.includes('en'));

  // Read and process subtitles
  let englishBlocks: string[] = [];
  if (engSrtFile) {
    const engRaw = await fsPromise.readFile(
      path.join(tmpDir, engSrtFile),
      'utf-8',
    );
    englishBlocks = engRaw.split(/\n\s*\n/); // split by blank lines
  }

  const targetRaw = await fsPromise.readFile(
    path.join(tmpDir, targetLangFilesFiltered),
    'utf-8',
  );

  const subtitles = [];
  const targetBlocks = targetRaw.split(/\n\s*\n/);
  targetBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const time = lines[1].split(' --> ');
      const rawText = lines.slice(2).join(' ').replace(/\r/g, '');
      const text = isTraditionalChineseSubtitle
        ? getTraditionalChineseConverter(targetLangFilesFiltered)(rawText)
        : rawText;

      // Try to find matching English block
      const engBlock = englishBlocks[index];
      let baseLang = '';
      if (engBlock) {
        const engLines = engBlock.trim().split('\n');
        if (engLines.length >= 3) {
          baseLang = engLines.slice(2).join(' ').replace(/\r/g, '');
        }
      }

      subtitles.push({
        index,
        start: time[0],
        end: time[1],
        targetLang: text,
        baseLang, // ✅ aligned English text if exists
      });
    }
  });

  const transcript = squashSubtitles(
    subtitles,
    language === chinese || language === japanese,
  );

  if (videoDownloaded) {
    return {
      status: 200,
      body: {
        transcript,
        publicUrl,
        publicVideoUrl,
        formatSelectionRequired: false,
      },
    };
  }

  let formats: YoutubeFormat[] = [];
  let formatListError: string | undefined;
  try {
    formats = await listYoutubeFormats(url);
  } catch (error) {
    console.error('## Failed to list formats', error);
    formatListError =
      error instanceof Error ? error.message : 'Failed to list formats';
  }

  return {
    status: 200,
    body: {
      transcript,
      publicUrl,
      publicVideoUrl: null,
      formatSelectionRequired: true,
      formats,
      ...(formatListError ? { formatListError } : {}),
    },
  };
}
