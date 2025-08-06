'use client';

import React, { useEffect, useRef, useState } from 'react';
import { mapKanaToTiming } from './kana-connection';
import { normalizeKana } from './normalize-kana';
import { fixOverlappingEndTimes } from './format-chunks';

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

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  audioUrl,
  audioQuery,
  chunks,
  dialogueOutput,
}) => {
  const [formattedTextState, setFormattedState] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dialogueOutput) {
      setFormattedState(dialogueOutput);
      return;
    }
    if (formattedTextState?.length > 0 && audioRef.current?.duration) {
      return;
    }

    const katakanaTimes = mapKanaToTiming(audioQuery);
    const normalisedChunks = chunks.map((item) => {
      return { ...item, reading: normalizeKana(item.reading) };
    });

    let i = 0;

    let overallMatchedKeys = [];
    let newArr = [];
    let startTimesArr = [];

    normalisedChunks.forEach((chunk) => {
      const reading = chunk.reading;
      let tempKana = '';
      let matchedKanas = [];

      while (i < katakanaTimes.length && tempKana.length < reading.length) {
        tempKana += katakanaTimes[i].kana;
        matchedKanas.push(katakanaTimes[i]);
        if (tempKana === reading) {
          overallMatchedKeys.push(i);
        }
        i++;
      }

      // if it's not a match, keep extending
      while (
        tempKana !== reading &&
        i < katakanaTimes.length &&
        !overallMatchedKeys.includes(i)
      ) {
        tempKana += katakanaTimes[i].kana;
        matchedKanas.push(katakanaTimes[i]);
        overallMatchedKeys.push(i);
        i++;
      }

      const updatedKatakanaTimeArr = katakanaTimes.filter(
        (kataItem) => !startTimesArr.includes(kataItem.start),
      );

      // If we still don't match, roll back the index
      if (tempKana !== reading) {
        // Try to find the match from scratch (fallback)
        for (
          let j = 0;
          j <= updatedKatakanaTimeArr.length - reading.length;
          j++
        ) {
          let temp = '',
            slice = [];
          for (let k = j; k < updatedKatakanaTimeArr.length; k++) {
            temp += updatedKatakanaTimeArr[k].kana;
            slice.push(updatedKatakanaTimeArr[k]);

            if (temp === reading && !overallMatchedKeys.includes(i)) {
              matchedKanas = slice;
              i = k + 1;
              break;
            }
            if (temp.length > reading.length) {
              break;
            }
          }

          if (matchedKanas.length > 0) {
            break;
          }
        }
      }

      const startTime = matchedKanas.length > 0 ? matchedKanas[0].start : null;

      if (startTime) {
        startTimesArr.push(startTime);
      }
      newArr.push({
        ...chunk,
        start: startTime,
        end:
          matchedKanas.length > 0
            ? matchedKanas[matchedKanas.length - 1].end
            : null,
      });
    });

    const fixedChunks = fixOverlappingEndTimes(newArr);

    console.log('## fixedChunks', fixedChunks);

    const myTing = fixedChunks;
    setFormattedState(myTing);
  }, [formattedTextState, audioRef]);

  return (
    <div className='w-full max-w-xl p-4 space-y-4 rounded-xl shadow-lg bg-white text-center m-auto'>
      <audio ref={audioRef} src={audioUrl} controls className='w-full' />

      <span>{currentTime.toFixed(2)}</span>
      <div className='text-lg font-mono flex flex-wrap justify-center gap-1 leading-relaxed'>
        {formattedTextState?.map(({ chunk, start, end }, index) => {
          const isActive = currentTime >= start && currentTime < end;

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
