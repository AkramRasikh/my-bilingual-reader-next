import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import os from 'os';
import { japanese, chinese, arabic } from '@/app/languages';
import squashSubtitles from './squashSubtitles';
import { downloadTargetLangSubs } from './downloadTargetLangSubs';
import { downloadBaseLangMachineSubs } from './downloadBaseLangMachineSubs';
import { downloadYoutubeAudio } from './downloadYoutubeAudio';
import { sanitizeFilename } from './santizeFilename';

export const googleLanguagesKey = {
  [japanese]: 'ja',
  [chinese]: 'zh-CN',
  [arabic]: 'ar',
};

const audioPath = path.join(process.cwd(), 'public', 'audio');

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

    try {
      await downloadTargetLangSubs({ outputTemplate, url });
    } catch (error) {
      console.log('## Failed to get Japaneses subs');
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    const japaneseFiles = await fsPromise.readdir(tmpDir);
    const japaneseSrtFiles = japaneseFiles.find((f) => f.endsWith('.ja.srt'));

    if (!japaneseSrtFiles) {
      return new Response(
        JSON.stringify({ error: 'No Japanese subtitles found' }),
        { status: 404 },
      );
    }

    const baseName = sanitizeFilename(String(title));
    const outTemplate = path.join(audioPath, `${baseName}.%(ext)s`);

    try {
      await downloadYoutubeAudio({ outTemplate, url });
    } catch (error) {
      console.log('## failed to get audio ', error);
    }

    const filesFromAudio = fs.readdirSync(audioPath);
    const file = filesFromAudio.find((f) => f.startsWith(baseName + '.'));
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Download finished but file not found.' }),
        { status: 500 },
      );
    }

    const publicUrl = `/audio/${encodeURIComponent(file)}`; // served from /public

    try {
      await downloadBaseLangMachineSubs({ outputTemplate, url });
    } catch (error) {
      console.log('## Failed to get English subs', error);
    }

    // Find the downloaded subtitle file
    const engFiles = await fsPromise.readdir(tmpDir);
    console.log('## engFiles', engFiles);

    const engSrtFile = engFiles.find((f) => f.endsWith('.en.srt'));
    console.log('## engSrtFile', engSrtFile);

    // Read and process subtitles
    const srtContent = await fsPromise.readFile(
      path.join(tmpDir, japaneseSrtFiles),
      'utf-8',
    );

    // Convert SRT → simple bilingual-friendly JSON
    // Format: [{ start, end, text }]
    const subtitles = [];
    const blocks = srtContent.split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const time = lines[1].split(' --> ');
        const text = lines.slice(2).join(' ').replace(/\r/g, '');
        subtitles.push({
          start: time[0],
          end: time[1],
          text,
        });
      }
    }

    return new Response(
      JSON.stringify({
        transcript: squashSubtitles(subtitles),
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
