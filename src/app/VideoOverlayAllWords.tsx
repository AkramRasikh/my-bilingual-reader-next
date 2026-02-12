'use client';
import { useMemo, useRef } from 'react';
import { SentenceMapItemTypes } from './types/content-types';
import { WordTypes } from './types/word-types';
import { useCurrentSentence } from './hooks/useCurrentSentence';

interface VideoOverlayAllWordsProps {
  currentTime: number;
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  contentMetaWordMemoized: WordTypes[];
  showTransliteration?: boolean;
}

interface WordOccurrence {
  word: WordTypes;
  position: number;
}

const VISIBILITY_BEFORE = 1.0;
const VISIBILITY_AFTER = 1.5;
const FADE_DURATION = 0.3;

const VideoOverlayAllWords = ({
  currentTime,
  sentenceMapMemoized,
  contentMetaWordMemoized,
  showTransliteration = false,
}: VideoOverlayAllWordsProps) => {
  const currentSentence = useCurrentSentence({
    currentTime,
    sentenceMapMemoized,
  });

  const stackPositionsRef = useRef<Map<number, number>>(new Map());

  const visibleWords = useMemo(() => {
    if (!currentSentence) return [];

    const sentenceText = currentSentence.targetLang;
    let matchedWords: WordOccurrence[] = [];

    // Find all saved words that appear in the current sentence
    contentMetaWordMemoized.forEach((word) => {
      const position = sentenceText.indexOf(word.surfaceForm);
      if (position !== -1) {
        matchedWords.push({ word, position });
      }
    });

    // Filter out engulfed words (those that are substrings of other matched words)
    matchedWords = matchedWords.filter(({ word }, idx, arr) => {
      return !arr.some(
        (other, otherIdx) =>
          otherIdx !== idx &&
          other.word.surfaceForm.includes(word.surfaceForm) &&
          other.word.surfaceForm !== word.surfaceForm
      );
    });

    // Sort by position in sentence
    return matchedWords.sort((a, b) => a.position - b.position);
  }, [currentSentence, contentMetaWordMemoized]);

  if (!currentSentence || visibleWords.length === 0) {
    return null;
  }

  const surfaceForms = visibleWords.map((w) => w.word.surfaceForm).join(', ');
  const transliterations = visibleWords
    .map((w) => w.word.transliteration)
    .filter(Boolean)
    .join(', ');
  const uniqueBaseForms = Array.from(
    new Set(
      visibleWords
        .filter((w) => w.word.baseForm !== w.word.surfaceForm)
        .map((w) => w.word.baseForm),
    ),
  );

  return (
    <div className='absolute inset-0 pointer-events-none'>
      <div
        className='absolute transition-all duration-300 ease-in-out'
        style={{
          top: '10px',
          right: '10px',
        }}
      >
        <div className='bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg'>
          <div className='flex flex-col gap-1'>
            <div className='font-bold text-lg m-auto'>{surfaceForms}</div>
            {showTransliteration && transliterations && (
              <div className='text-sm text-gray-400 italic'>
                {transliterations}
              </div>
            )}
            {uniqueBaseForms.length > 0 && (
              <div className='text-sm text-gray-300'>
                ({uniqueBaseForms.join(', ')})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlayAllWords;
