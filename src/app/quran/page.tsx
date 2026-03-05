'use client';

import React from 'react';

type Segment = [number, number, number, number];

type Word = {
  id?: number;
  text?: string;
  textUthmani?: string | null;
  charTypeName: string;
  translation?: {
    text?: string | null;
  };
  transliteration?: {
    text?: string | null;
  };
};

type Verse = {
  id: number;
  verseNumber: number;
  verseKey: string;
  words: Word[];
};

type VerseAudio = {
  verseKey: string;
  url: string;
  segments?: Segment[];
};

type ApiResponse = {
  chapterId: string;
  reciterId: string;
  verse: Verse[];
  verseAudio: VerseAudio[];
};

type WordCue = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  startMs: number | null;
  endMs: number | null;
};

type VerseModel = {
  verseId: number;
  verseNumber: number;
  verseKey: string;
  audioUrl: string | null;
  durationMs: number;
  words: WordCue[];
};

const HARDCODED_CHAPTER_ID = 93;
const HARDCODED_RECITER_ID = '7';
const VERSE_AUDIO_BASE_URL = 'https://verses.quran.com/';

const resolveVerseAudioUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${VERSE_AUDIO_BASE_URL}${url}`;
};

const findSegmentForWord = (
  segments: Segment[] | undefined,
  wordIndex: number,
) => {
  if (!segments?.length) return undefined;

  return (
    segments.find(([from, to]) => wordIndex >= from && wordIndex < to) ??
    segments.find(([from]) => wordIndex === from) ??
    segments[wordIndex]
  );
};

export default function QuranPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [verseModels, setVerseModels] = React.useState<VerseModel[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = React.useState(0);
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayNextRef = React.useRef(false);

  React.useEffect(() => {
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
            chapterId: HARDCODED_CHAPTER_ID,
            reciterId: HARDCODED_RECITER_ID,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }

        const json = (await res.json()) as ApiResponse;
        const verseAudioByKey = new Map(
          (json.verseAudio ?? []).map((entry) => [entry.verseKey, entry]),
        );

        const models = (json.verse ?? [])
          .slice()
          .sort((a, b) => a.verseNumber - b.verseNumber)
          .map((verse) => {
            const audioEntry = verseAudioByKey.get(verse.verseKey);
            const segments = audioEntry?.segments ?? [];
            const words = (verse.words ?? []).filter(
              (word) => word.charTypeName === 'word',
            );

            const wordCues: WordCue[] = words.map((word, wordIndex) => {
              const segment = findSegmentForWord(segments, wordIndex);
              return {
                id: `${verse.verseKey}-${wordIndex}`,
                arabic: word.textUthmani ?? word.text ?? '',
                transliteration: word.transliteration?.text ?? '',
                english: word.translation?.text ?? '',
                startMs: segment?.[2] ?? null,
                endMs: segment?.[3] ?? null,
              };
            });

            const durationMs = segments.length
              ? Math.max(...segments.map((segment) => segment[3]))
              : 0;

            return {
              verseId: verse.id,
              verseNumber: verse.verseNumber,
              verseKey: verse.verseKey,
              audioUrl: resolveVerseAudioUrl(audioEntry?.url),
              durationMs,
              words: wordCues,
            };
          });

        setVerseModels(models);
        setCurrentVerseIndex(0);
        setCurrentTimeMs(0);
      } catch {
        setError('Failed to fetch Quran data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuranData();
  }, []);

  const currentVerse = verseModels[currentVerseIndex] ?? null;
  const currentVerseAudioSrc = currentVerse?.audioUrl ?? '';

  React.useEffect(() => {
    setCurrentTimeMs(0);
  }, [currentVerseIndex]);

  const handleTogglePlay = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (audioEl.paused) {
      try {
        await audioEl.play();
      } catch {
        setError('Autoplay was blocked. Press play again.');
      }
      return;
    }

    audioEl.pause();
  };

  const handlePrevVerse = () => {
    setCurrentVerseIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextVerse = () => {
    setCurrentVerseIndex((prev) => Math.min(verseModels.length - 1, prev + 1));
  };

  const handlePlayVerseAtIndex = async (verseIndex: number) => {
    const targetIndex = Math.max(
      0,
      Math.min(verseModels.length - 1, verseIndex),
    );
    const isSameVerse = targetIndex === currentVerseIndex;

    shouldAutoPlayNextRef.current = true;
    setError(null);

    if (isSameVerse && audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
      } catch {
        setError('Autoplay was blocked. Press play again.');
      }
      return;
    }

    setCurrentVerseIndex(targetIndex);
  };

  const activeWordId = React.useMemo(() => {
    if (!currentVerse) return null;

    const activeWord = currentVerse.words.find((word, index) => {
      if (typeof word.startMs !== 'number') return false;

      const nextStart = currentVerse.words[index + 1]?.startMs;
      const endBoundary =
        typeof word.endMs === 'number'
          ? word.endMs
          : typeof nextStart === 'number'
            ? nextStart
            : currentVerse.durationMs;

      return currentTimeMs >= word.startMs && currentTimeMs < endBoundary;
    });

    return activeWord?.id ?? null;
  }, [currentTimeMs, currentVerse]);

  return (
    <main style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Quran Word Follow</h1>
      <p>
        Chapter {HARDCODED_CHAPTER_ID}, Reciter {HARDCODED_RECITER_ID}
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && currentVerse && (
        <section style={{ marginBottom: '1rem' }}>
          <h2>Playback</h2>
          <p>
            Verse {currentVerse.verseNumber} ({currentVerse.verseKey})
          </p>

          <audio
            key={currentVerse.verseKey}
            ref={audioRef}
            controls
            src={currentVerseAudioSrc}
            onLoadedMetadata={async () => {
              if (shouldAutoPlayNextRef.current && audioRef.current) {
                try {
                  await audioRef.current.play();
                } catch {
                  setIsPlaying(false);
                }
              }
            }}
            onPlay={() => {
              setIsPlaying(true);
              shouldAutoPlayNextRef.current = true;
            }}
            onPause={() => {
              setIsPlaying(false);
              shouldAutoPlayNextRef.current = false;
            }}
            onTimeUpdate={() => {
              const seconds = audioRef.current?.currentTime ?? 0;
              setCurrentTimeMs(Math.floor(seconds * 1000));
            }}
            onEnded={() => {
              const hasNext = currentVerseIndex < verseModels.length - 1;
              if (hasNext) {
                shouldAutoPlayNextRef.current = true;
                setCurrentVerseIndex((prev) => prev + 1);
              } else {
                shouldAutoPlayNextRef.current = false;
                setIsPlaying(false);
              }
            }}
          >
            Your browser does not support the audio element.
          </audio>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type='button'
              onClick={handlePrevVerse}
              disabled={currentVerseIndex === 0}
            >
              Previous Verse
            </button>
            <button type='button' onClick={handleTogglePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type='button'
              onClick={handleNextVerse}
              disabled={currentVerseIndex >= verseModels.length - 1}
            >
              Next Verse
            </button>
          </div>

          <p>Current verse time: {(currentTimeMs / 1000).toFixed(2)}s</p>
        </section>
      )}

      {!loading && verseModels.length > 0 && (
        <section>
          <h2>Surah Words</h2>
          {verseModels.map((verse, verseIndex) => {
            const isCurrentVerse = verseIndex === currentVerseIndex;
            const sentenceEnglish = verse.words
              .map((word) => word.english)
              .filter((text) => Boolean(text))
              .join(' ')
              .trim();

            return (
              <article
                key={verse.verseKey}
                style={{
                  marginBottom: '0.55rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0.4rem',
                  padding: '0.5rem',
                  background: isCurrentVerse ? '#fff9e6' : '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <h3
                    style={{ marginTop: 0, marginBottom: 0, fontSize: '1rem' }}
                  >
                    Verse {verse.verseNumber} ({verse.verseKey})
                  </h3>
                  <button
                    type='button'
                    onClick={() => {
                      void handlePlayVerseAtIndex(verseIndex);
                    }}
                  >
                    Play
                  </button>
                </div>

                <div
                  style={{
                    direction: 'rtl',
                    textAlign: 'right',
                    fontSize: '1.55rem',
                    lineHeight: 1.55,
                  }}
                >
                  {verse.words.map((word, index) => {
                    const isActive = isCurrentVerse && activeWordId === word.id;
                    return (
                      <span
                        key={word.id}
                        style={{
                          background: isActive ? '#ffe08a' : 'transparent',
                          borderRadius: isActive ? '0.2rem' : 0,
                        }}
                      >
                        {word.arabic || '-'}
                        {index < verse.words.length - 1 ? ' ' : ''}
                      </span>
                    );
                  })}
                </div>

                <p
                  style={{
                    marginTop: '0.35rem',
                    color: '#666',
                    fontStyle: 'italic',
                    lineHeight: 1.45,
                    fontSize: '0.95rem',
                  }}
                >
                  {verse.words.map((word) => {
                    const isActive = isCurrentVerse && activeWordId === word.id;
                    return (
                      <span
                        key={`tr-${word.id}`}
                        style={{
                          background: isActive ? '#ffe08a' : 'transparent',
                          borderRadius: '0.25rem',
                          paddingInline: '0.15rem',
                          marginRight: '0.25rem',
                        }}
                      >
                        {word.transliteration || '-'}
                      </span>
                    );
                  })}
                </p>

                <p
                  style={{
                    marginTop: '0.25rem',
                    color: '#444',
                    lineHeight: 1.45,
                    fontSize: '0.95rem',
                  }}
                >
                  {verse.words.map((word) => {
                    const isActive = isCurrentVerse && activeWordId === word.id;
                    return (
                      <span
                        key={`def-${word.id}`}
                        style={{
                          background: isActive ? '#ffe08a' : 'transparent',
                          borderRadius: '0.25rem',
                          paddingInline: '0.15rem',
                          marginRight: '0.25rem',
                        }}
                      >
                        {word.english || '-'}
                        {' + '}
                      </span>
                    );
                  })}
                </p>

                {sentenceEnglish && (
                  <p
                    style={{
                      marginTop: '0.2rem',
                      color: '#222',
                      lineHeight: 1.45,
                      fontSize: '0.95rem',
                    }}
                  >
                    {sentenceEnglish}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
