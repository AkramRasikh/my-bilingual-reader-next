'use client';

import { ChapterRecitation } from '@quranjs/api';
import React, { useEffect, useState } from 'react';

type Word = {
  text: string;
  textUthmani?: string | null;
  charTypeName: string;
  translation?: {
    text?: string | null;
  };
  transliteration?: {
    text?: string | null;
  };
};

type VerseAudio = {
  verseKey: string;
  url: string;
  segments?: [number, number, number, number][];
};

type Verse = {
  id: number;
  verseNumber: number;
  verseKey: string;
  words: Word[];
};

export default function QuranPage() {
  const [data, setData] = useState<Verse[] | null>(null);
  const [audio, setAudio] = useState<ChapterRecitation | null>(null);
  const [verseAudio, setVerseAudio] = useState<VerseAudio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuranData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/getQuranData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chapterId: 93,
          }),
        });
        const json = await res.json();

        setData(json.thisChapter ?? json.verse ?? null);
        setAudio(json.audio ?? null);
        setVerseAudio(json.verseAudio ?? null);
      } catch {
        setError('Failed to fetch Quran data');
      } finally {
        setLoading(false);
      }
    };
    fetchQuranData();
  }, []);

  const renderVerses = (verses: Verse[]) => {
    return verses.map((verse) => {
      const arabicLine = verse.words
        .map((word) => word.textUthmani)
        .filter(Boolean)
        .join(' ')
        .trim();

      const englishLine = verse.words
        .filter((word) => word.charTypeName !== 'end')
        .map((word) => word.translation?.text)
        .filter((text): text is string => Boolean(text))
        .join(' ')
        .trim();

      const transliterationLine = verse.words
        .filter((word) => word.charTypeName !== 'end')
        .map((word) => word.transliteration?.text)
        .filter((text): text is string => Boolean(text))
        .join(' ')
        .trim();

      return (
        <article key={verse.id} style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '1.5rem', direction: 'rtl', margin: 0 }}>
            {arabicLine}
          </p>
          <p style={{ marginTop: '0.25rem', color: '#555' }}>{englishLine}</p>
          <p
            style={{ marginTop: '0.25rem', color: '#777', fontStyle: 'italic' }}
          >
            {transliterationLine}
          </p>
        </article>
      );
    });
  };

  return (
    <main>
      <h1>Quran Page</h1>
      <p>Welcome to the Quran section.</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {audio && (
        <section>
          <h2>Audio Recitation</h2>
          <audio controls src={audio.audioUrl}>
            Your browser does not support the audio element.
          </audio>
          {verseAudio && (
            <p>Verse-level timings available for {verseAudio.length} verses.</p>
          )}
        </section>
      )}
      {data && (
        <section>
          <h2>Surah Content</h2>
          {renderVerses(data)}
        </section>
      )}
    </main>
  );
}
