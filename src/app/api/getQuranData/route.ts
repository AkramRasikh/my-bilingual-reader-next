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

    const chapterAudio = await client.audio.findChapterRecitationById(
      reciterIdStr,
      chapterIdStr,
    );

    const chapterMeta = await client.chapters.findById(chapterIdStr);
    const expectedVerseCount = chapterMeta.versesCount;

    const allVerses = [];
    let versePage = 1;

    while (allVerses.length < expectedVerseCount) {
      const versePageResponse = await client.verses.findByChapter(
        chapterIdStr,
        {
          words: true,
          reciter: reciterId,
          page: versePage,
          perPage: 50,
          wordFields: {
            textUthmani: true,
          },
          fields: { textUthmani: true },
        },
      );

      if (!versePageResponse.length) {
        break;
      }

      allVerses.push(...versePageResponse);
      versePage += 1;
    }

    const firstVerseAudioPage =
      await client.audio.findVerseRecitationsByChapter(
        chapterIdStr,
        reciterIdStr,
        {
          fields: { segments: true },
        },
      );

    const allVerseAudioFiles = [...firstVerseAudioPage.audioFiles];
    let nextPage = firstVerseAudioPage.pagination.nextPage;

    while (nextPage) {
      const nextPageParam: Record<string, number> = { page: nextPage };

      const nextVerseAudioPage =
        await client.audio.findVerseRecitationsByChapter(
          chapterIdStr,
          reciterIdStr,
          {
            fields: { segments: true },
            ...nextPageParam,
          },
        );

      allVerseAudioFiles.push(...nextVerseAudioPage.audioFiles);
      nextPage = nextVerseAudioPage.pagination.nextPage;
    }

    const versesSorted = allVerses.sort(
      (a, b) => a.verseNumber - b.verseNumber,
    );
    const verseAudioSorted = allVerseAudioFiles.sort((a, b) =>
      a.verseKey.localeCompare(b.verseKey, undefined, { numeric: true }),
    );

    return NextResponse.json(
      {
        chapterId: chapterIdStr,
        reciterId: reciterIdStr,
        verse: versesSorted,
        audio: chapterAudio,
        verseAudio: verseAudioSorted,
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
