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
import * as OpenCC from 'opencc-js';

export const googleLanguagesKey = {
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

export async function POST(req) {
  try {
    const { url, title, language } = await req.json();
    console.log('## ', {
      url,
      title,
      language,
    });

    if (!url || !title || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing either: url, title or language' }),
        {
          status: 400,
        },
      );
    }

    // Step 1: Try downloading human-generated English subs
    const tmpDir = await fsPromise.mkdtemp(path.join(os.tmpdir(), 'yt-'));
    const outputTemplate = path.join(tmpDir, 'video');

    const googleLangCode = googleLanguagesKey[language] as string;
    try {
      await downloadTargetLangSubs({ outputTemplate, url, googleLangCode });
    } catch (error) {
      console.log('## Failed to get Japaneses subs');
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
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
      return new Response(
        JSON.stringify({ error: `No ${language} subtitles found` }),
        { status: 404 },
      );
    }

    const baseName = sanitizeFilename(String(title));
    const audioOutputPath = path.join(youtubeAudioPath, `${baseName}.%(ext)s`);
    const videoOutputPath = path.join(youtubeVideoPath, `${baseName}.%(ext)s`);

    try {
      await downloadYoutubeAudio({ outTemplate: audioOutputPath, url });
      await downloadYoutubeVideo({ outTemplate: videoOutputPath, url });
    } catch (error) {
      console.log('## failed to get audio ', error);
    }

    const filesFromAudio = fs.readdirSync(youtubeAudioPath);
    const file = filesFromAudio.find((f) => f.startsWith(baseName + '.'));
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Download finished but file not found.' }),
        { status: 500 },
      );
    }

    const publicUrl = `/youtube/${encodeURIComponent(file)}`; // served from /public

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

    return new Response(
      JSON.stringify({
        transcript: squashSubtitles(
          subtitles,
          language === chinese || language === japanese,
        ),
        publicUrl,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
