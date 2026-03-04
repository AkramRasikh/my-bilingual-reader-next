import { QuranClient, isValidChapterId, Language } from '@quranjs/api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      language = Language.ENGLISH,
      chapterId = 93,
      reciterId = '7',
    } = body;
    const chapterIdStr = String(chapterId);
    if (!isValidChapterId(chapterIdStr)) {
      return NextResponse.json(
        { error: 'Invalid chapterId. Use a number from 1 to 114.' },
        { status: 400 },
      );
    }
    const reciterIdStr = String(reciterId);

    const clientId = process.env.NEXT_PUBLIC_QURAN_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_QURAN_CLIENT_SECRET;
    const authBaseUrl = process.env.NEXT_PUBLIC_QURAN_API_AUTH_BASE_URL;
    const contentBaseUrl = process.env.NEXT_PUBLIC_QURAN_API_CONTENT_BASE_URL;

    if (!clientId || !clientSecret || !authBaseUrl || !contentBaseUrl) {
      return NextResponse.json(
        { error: 'Missing Quran API environment configuration.' },
        { status: 500 },
      );
    }

    const client = new QuranClient({
      defaults: { language },
      clientId,
      clientSecret,
      authBaseUrl,
      contentBaseUrl,
    });

    const verse = await client.verses.findByChapter(chapterIdStr, {
      words: true,
      wordFields: {
        v1Page: true,
        v2Page: true,
        codeV2: true,
        codeV1: true,
        textUthmani: true,
      },
    });

    const chapterAudio = await client.audio.findChapterRecitationById(
      reciterIdStr,
      chapterIdStr,
    );

    const verseAudio = await client.audio.findVerseRecitationsByChapter(
      chapterIdStr,
      reciterIdStr,
      { fields: { segments: true } },
    );

    console.log('## Resp:', {
      verse,
      audio: chapterAudio,
      verseAudio: JSON.stringify(verseAudio.audioFiles),
    });

    return NextResponse.json(
      {
        chapterId: chapterIdStr,
        reciterId: reciterIdStr,
        verse,
        audio: chapterAudio,
        verseAudio: verseAudio.audioFiles,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error getQuranData:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Quran data' },
      { status: 500 },
    );
  }
}
