'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  }, [formattedTextState]);

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
