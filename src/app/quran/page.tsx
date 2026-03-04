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

type VerseRenderRow = {
  id: number;
  arabicLine: string;
  englishLine: string;
  transliterationLine: string;
  time: number;
  endTime: number;
};

export default function QuranPage() {
  const [data, setData] = useState<Verse[] | null>(null);
  const [audio, setAudio] = useState<ChapterRecitation | null>(null);
  const [verseAudio, setVerseAudio] = useState<VerseAudio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBucket, setCurrentBucket] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const durationRef = React.useRef<number>(0);
  const currentTimeRef = React.useRef<number>(0);
  const currentTimeTextRef = React.useRef<HTMLSpanElement | null>(null);
  const currentBucketRef = React.useRef<number>(0);

  const syncAudioDurationRef = () => {
    durationRef.current = audioRef.current?.duration ?? 0;
  };

  const syncAudioCurrentTimeRef = () => {
    currentTimeRef.current = audioRef.current?.currentTime ?? 0;
    const nextBucket = Math.floor((currentTimeRef.current * 1000) / 500);
    if (nextBucket !== currentBucketRef.current) {
      currentBucketRef.current = nextBucket;
      setCurrentBucket(nextBucket);
    }
    if (currentTimeTextRef.current) {
      currentTimeTextRef.current.textContent =
        currentTimeRef.current.toFixed(3);
    }
  };

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

        console.log(json);

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

  const verseRows = React.useMemo<VerseRenderRow[]>(() => {
    if (!data) return [];

    let cumulativeTimeMs = 0;

    return data.map((verse, verseIndex) => {
      const nestedSegment = verseAudio?.[verseIndex].segments;
      const lineStartTimeMs = cumulativeTimeMs;
      const verseEndTimeMs = nestedSegment?.length
        ? nestedSegment[nestedSegment.length - 1][3]
        : 0;

      cumulativeTimeMs += verseEndTimeMs;

      const arabicLine = verse.words
        .map((word) => word.textUthmani)
        .filter((text): text is string => Boolean(text))
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

      return {
        id: verse.id,
        arabicLine,
        englishLine,
        transliterationLine,
        time: lineStartTimeMs,
        endTime: lineStartTimeMs + verseEndTimeMs,
      };
    });
  }, [data, verseAudio]);

  const secondsVerseIdArray = React.useMemo<number[]>(() => {
    if (!verseRows.length) return [];

    const totalDurationMs = verseRows[verseRows.length - 1].endTime;
    const halfSecondStepMs = 500;
    const numberOfPoints = Math.ceil(totalDurationMs / halfSecondStepMs);

    return Array.from({ length: numberOfPoints }, (_, index) => {
      const currentTimeMs = index * halfSecondStepMs;
      const activeVerse =
        verseRows.find(
          (row) => currentTimeMs >= row.time && currentTimeMs < row.endTime,
        ) ?? verseRows[verseRows.length - 1];

      return activeVerse.id;
    });
  }, [verseRows]);

  // console.log('## verseRows', verseRows);
  // console.log('## secondsVerseIdArray', secondsVerseIdArray);

  const masterVerse = secondsVerseIdArray[currentBucket] ?? null;

  // console.log('## masterVerse', masterVerse);

  return (
    <main>
      <h1>Quran Page</h1>
      <p>Welcome to the Quran section.</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {audio && (
        <section>
          <h2>Audio Recitation</h2>
          <audio
            ref={audioRef}
            controls
            src={audio.audioUrl}
            onLoadedMetadata={syncAudioDurationRef}
            onDurationChange={syncAudioDurationRef}
            onTimeUpdate={syncAudioCurrentTimeRef}
            onSeeked={syncAudioCurrentTimeRef}
            onLoadedData={syncAudioCurrentTimeRef}
          >
            Your browser does not support the audio element.
          </audio>
          <p>
            Current time (s): <span ref={currentTimeTextRef}>0.000</span>
          </p>
          {verseAudio && (
            <p>Verse-level timings available for {verseAudio.length} verses.</p>
          )}
        </section>
      )}
      {data && (
        <section>
          <h2>Surah Content</h2>
          {verseRows.map((row) => (
            <article key={row.id} style={{ marginBottom: '1rem' }}>
              <p
                style={{
                  fontSize: '1.5rem',
                  direction: 'rtl',
                  margin: 0,
                  backgroundColor:
                    masterVerse === row.id ? '#fffae6' : 'transparent',
                }}
              >
                {row.arabicLine}
              </p>
              <p style={{ marginTop: '0.25rem', color: '#555' }}>
                {row.englishLine}
              </p>
              <p
                style={{
                  marginTop: '0.25rem',
                  color: '#777',
                  fontStyle: 'italic',
                }}
              >
                {row.transliterationLine}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
