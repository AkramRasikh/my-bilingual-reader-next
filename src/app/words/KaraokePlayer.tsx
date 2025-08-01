'use client';

import React, { useEffect, useRef, useState } from 'react';
import { mapKanaToTiming } from './kana-connection';

type Mora = {
  text: string; // kana
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
  pitch: number;
};

type AccentPhrase = {
  moras: Mora[];
  accent: number;
  pause_mora?: Mora;
  is_interrogative: boolean;
};

type AudioQuery = {
  accent_phrases: AccentPhrase[];
  kana: string;
  // ... other VOICEVOX fields
};

type KaraokePlayerProps = {
  audioUrl: string;
  audioQuery: AudioQuery;
};

function normalizeKana(kana: string): string {
  if (kana === 'ハ') return 'ワ'; // special case for particle 'は'
  return kana.replace(/ヲ/g, 'オ').replace(/ウ/g, 'オ'); // Treat ウ as interchangeable with オ in phoneme alignment
}

// function normalizeKana(katakana) {
//   if (katakana === 'ハ') return 'ワ'; // special case for particle 'は'
//   return katakana
//     .replace(/ヲ/g, 'オ')
//     .replace(/ヴ/g, 'ウ')
//     .replace(/ー/g, '') // optional: retain if you want to do advanced duration mapping
//     .replace(/[。、！？・（）「」『』]/g, '') // remove Japanese punctuation
//     .replace(/\s+/g, '') // remove whitespace
//     .toUpperCase(); // in case any lowercase sneaks in
// }
export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  audioUrl,
  audioQuery,
  chunks,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const katakanaTimes = mapKanaToTiming(audioQuery);
  const normalisedChunks = chunks.map((item) => {
    return { ...item, reading: normalizeKana(item.reading) };
  });

  console.log('## KaraokePlayer ', { katakanaTimes, chunks });

  let i = 0;

  const enriched = normalisedChunks.map((chunk) => {
    const reading = chunk.reading;
    let tempKana = '';
    const startIndex = i;
    let matchedKanas = [];

    while (i < katakanaTimes.length && tempKana.length < reading.length) {
      tempKana += katakanaTimes[i].kana;
      matchedKanas.push(katakanaTimes[i]);
      i++;
    }

    // if it's not a match, keep extending
    while (tempKana !== reading && i < katakanaTimes.length) {
      tempKana += katakanaTimes[i].kana;
      matchedKanas.push(katakanaTimes[i]);
      i++;
    }

    // If we still don't match, roll back the index
    if (tempKana !== reading) {
      // Try to find the match from scratch (fallback)
      for (let j = 0; j <= katakanaTimes.length - reading.length; j++) {
        let temp = '',
          slice = [];
        for (let k = j; k < katakanaTimes.length; k++) {
          temp += katakanaTimes[k].kana;
          slice.push(katakanaTimes[k]);
          if (temp === reading) {
            matchedKanas = slice;
            i = k + 1;
            break;
          }
          if (temp.length > reading.length) break;
        }
        if (matchedKanas.length > 0) break;
      }
    }

    return {
      ...chunk,
      start: matchedKanas.length > 0 ? matchedKanas[0].start : null,
      end:
        matchedKanas.length > 0
          ? matchedKanas[matchedKanas.length - 1].end
          : null,
    };
  });

  console.log('## enriched', enriched);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  function fixOverlappingEndTimes(data) {
    // Filter out entries with null start/end times
    const validData = data.filter(
      (item) => item.start !== null && item.end !== null,
    );

    for (let i = 0; i < validData.length; i++) {
      const current = validData[i];
      let minNextStart = Infinity;

      // Find the smallest start time among all following items
      for (let j = i + 1; j < validData.length; j++) {
        if (validData[j].start < minNextStart) {
          minNextStart = validData[j].start;
        }
      }

      // Only adjust if:
      // 1. There is a following item (`minNextStart` is not Infinity)
      // 2. The current `end` exceeds `minNextStart` (overlap)
      // 3. `minNextStart` is *after* the current `start` (to prevent `end < start`)
      if (
        minNextStart !== Infinity &&
        current.end > minNextStart &&
        minNextStart > current.start
      ) {
        current.end = minNextStart;
      }
    }

    // Return the fixed data (including originally null entries)
    return data.map((item) => {
      if (item.start === null || item.end === null) return item;
      const fixedItem = validData.find(
        (x) =>
          x.chunk === item.chunk &&
          x.reading === item.reading &&
          x.start === item.start,
      );
      return fixedItem || item;
    });
  }
  // const fixedChunks = fixChunkOverlaps(enriched);
  // const fixedChunks = fixChunkOverlapsGlobally(enriched);
  const fixedChunks = fixOverlappingEndTimes(enriched);
  console.log('## fixedChunks', fixedChunks);

  // const fixedChunks = normalizeChunksTimeline(
  //   enriched,
  //   audioRef.current?.duration,
  // );

  return (
    <div className='w-full max-w-xl p-4 space-y-4 rounded-xl shadow-lg bg-white text-center'>
      <audio ref={audioRef} src={audioUrl} controls className='w-full' />
      <div className='text-3xl font-mono flex flex-wrap justify-center gap-1 leading-relaxed'>
        {fixedChunks.map(({ chunk, start, end }, index) => {
          const isLast = index === fixedChunks.length - 1;
          let isActive;
          if (isLast) {
            isActive =
              currentTime >= fixedChunks[index - 1].start &&
              currentTime !== audioRef.current?.duration;
          } else {
            isActive = currentTime >= start && currentTime < end;
          }

          return (
            <span
              key={index}
              className={`transition-colors duration-75 ${
                isActive ? 'text-red-500 font-bold' : 'text-gray-700'
              }`}
            >
              {chunk}
            </span>
          );
        })}
      </div>
    </div>
  );
};
