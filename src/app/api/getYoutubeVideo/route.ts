import { execa } from 'execa';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import os from 'os';
import { japanese, chinese, arabic } from '@/app/languages';
import squashSubtitles from './squashSubtitles';

export const googleLanguagesKey = {
  [japanese]: 'ja',
  [chinese]: 'zh-CN',
  [arabic]: 'ar',
};

function sanitizeFilename(name: string) {
  // Remove path separators and unsafe chars; keep letters, numbers, dash, underscore, and spaces
  const cleaned = name
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '') // remove reserved chars
    .replace(/[:]/g, '-'); // avoid colon in filenames
  // further strip any remaining problematic characters
  return cleaned.replace(/[^\w\- .()]/g, '');
}

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

    const baseName = sanitizeFilename(String(title));

    console.log('## baseName', baseName);

    const outTemplate = path.join(audioPath, `${baseName}.%(ext)s`);

    await execa(
      'yt-dlp',
      [
        '-x', // extract audio
        '--audio-format',
        'mp3', // convert to mp3
        '-o',
        outTemplate,
        url,
      ],
      { stdout: 'pipe', stderr: 'pipe' },
    );

    const filesFromAudio = fs.readdirSync(audioPath);
    const file = filesFromAudio.find((f) => f.startsWith(baseName + '.'));
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Download finished but file not found.' }),
        { status: 500 },
      );
    }

    const publicUrl = `/audio/${encodeURIComponent(file)}`; // served from /public

    // Temporary file path
    const tmpDir = await fsPromise.mkdtemp(path.join(os.tmpdir(), 'yt-'));
    const outputTemplate = path.join(tmpDir, 'video');

    // Step 1: Try downloading human-generated English subs
    try {
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
    } catch (error) {
      // Step 2: Fallback to auto-generated subs
      console.log('## Failed to get Japaneses subs');
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    try {
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
    } catch (error) {
      console.log('## Failed to get English subs', error);
    }

    // Find the downloaded subtitle file
    const files = await fsPromise.readdir(tmpDir);
    console.log('## files', files);

    const japaneseSrtFiles = files.find((f) => f.endsWith('.ja.srt'));
    const engSrtFile = files.find((f) => f.endsWith('.en.srt'));
    console.log('## engSrtFile', engSrtFile);

    if (!japaneseSrtFiles) {
      return new Response(
        JSON.stringify({ error: 'No Japanese subtitles found' }),
        { status: 404 },
      );
    }

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

    // return new Response(JSON.stringify({ url, subtitles }), {
    //   headers: { 'Content-Type': 'application/json' },
    // });

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
