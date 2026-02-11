'use client';
import { useMemo, useRef } from 'react';
import { WordTypes } from './types/word-types';
import { SentenceMapItemTypes } from './types/content-types';

interface VideoOverlayProps {
  contentMetaWordMemoized: WordTypes[];
  currentTime: number;
  showTransliteration?: boolean;
  sentenceMapMemoized?: Record<string, SentenceMapItemTypes>;
}

interface WordGroup {
  time: number;
  words: WordTypes[];
  stackIndex: number;
  opacity: number;
}

const VISIBILITY_BEFORE = 1.0; // Show 1 second before word time
const VISIBILITY_AFTER = 1.5; // Show 1.5 seconds after word time
const FADE_DURATION = 0.3; // 300ms fade in/out

const VideoOverlay = ({
  contentMetaWordMemoized,
  currentTime,
  showTransliteration = false,
  sentenceMapMemoized = {},
}: VideoOverlayProps) => {
  // Maintain stable stack positions across renders
  const stackPositionsRef = useRef<Map<number, number>>(new Map());

  const visibleWordGroups = useMemo(() => {
    const wordsWithTime = contentMetaWordMemoized.filter(
      (word) => word.time !== undefined && word.time !== null,
    );

    // Find words within the visibility window (-1 sec to +1.5 sec)
    const activeWords = wordsWithTime.filter((word) => {
      const wordTime = word.time || 0;
      return (
        currentTime >= wordTime - VISIBILITY_BEFORE &&
        currentTime <= wordTime + VISIBILITY_AFTER
      );
    });

    // Group words by their exact time
    const wordsByTime = new Map<number, WordTypes[]>();
    activeWords.forEach((word) => {
      const time = word.time || 0;
      if (!wordsByTime.has(time)) {
        wordsByTime.set(time, []);
      }
      wordsByTime.get(time)!.push(word);
    });

    // Create word groups with opacity and stacking
    const groups: WordGroup[] = [];
    const sortedTimes = Array.from(wordsByTime.keys()).sort((a, b) => a - b);
    // Words should stack if their visibility windows overlap
    const overlapThreshold = VISIBILITY_BEFORE + VISIBILITY_AFTER;

    sortedTimes.forEach((time) => {
      const wordsAtTime = wordsByTime.get(time)!;

      // Filter out words that are engulfed by other words at the same time
      const filteredWords = wordsAtTime.filter((word) => {
        // Check if this word's surfaceForm is contained in any other word's surfaceForm
        const isEngulfed = wordsAtTime.some(
          (otherWord) =>
            otherWord.id !== word.id &&
            otherWord.surfaceForm.includes(word.surfaceForm),
        );
        return !isEngulfed;
      });

      // Helper function to find the sentence containing a word based on time
      const findSentenceForWord = (word: WordTypes): SentenceMapItemTypes | null => {
        const wordTime = word.time || 0;
        // Find sentences within 3 seconds of the word's time
        const candidates = Object.values(sentenceMapMemoized).filter((sentence) => {
          return Math.abs(sentence.time - wordTime) < 3;
        });
        
        // Prefer sentence that contains the word's surfaceForm
        const exactMatch = candidates.find((sentence) => 
          sentence.targetLang.includes(word.surfaceForm)
        );
        
        return exactMatch || null;
      };

      // Sort words by their position in the original sentence
      const sortedWords = filteredWords.sort((a, b) => {
        // Find the sentences containing each word
        const sentenceA = findSentenceForWord(a);
        const sentenceB = findSentenceForWord(b);

        // If both words are from the same sentence, sort by position in that sentence
        if (sentenceA && sentenceB && sentenceA.id === sentenceB.id) {
          const sentenceText = sentenceA.targetLang;
          const posA = sentenceText.indexOf(a.surfaceForm);
          const posB = sentenceText.indexOf(b.surfaceForm);

          // If both found in sentence, sort by position
          if (posA !== -1 && posB !== -1) {
            return posA - posB;
          }
        }

        // Fallback to original order (no change)
        return 0;
      });

      // Calculate opacity based on time difference for smooth fade
      const timeDiff = currentTime - time;

      let opacity = 1;
      // Fade in when approaching from before
      if (timeDiff < -VISIBILITY_BEFORE + FADE_DURATION) {
        opacity = 1 - Math.abs(timeDiff + VISIBILITY_BEFORE) / FADE_DURATION;
      }
      // Fade out when leaving to after
      else if (timeDiff > VISIBILITY_AFTER - FADE_DURATION) {
        opacity =
          1 - (timeDiff - (VISIBILITY_AFTER - FADE_DURATION)) / FADE_DURATION;
      }

      // Assign a stable stack position that persists across renders
      let stackIndex: number;

      if (stackPositionsRef.current.has(time)) {
        // Use previously assigned position
        stackIndex = stackPositionsRef.current.get(time)!;
      } else {
        // Find the first available stack slot among overlapping times
        const overlappingTimes = sortedTimes.filter((t) => {
          return Math.abs(time - t) < overlapThreshold;
        });

        const usedStacks = new Set(
          overlappingTimes
            .filter((t) => stackPositionsRef.current.has(t))
            .map((t) => stackPositionsRef.current.get(t)!),
        );

        // Find the first available stack index
        stackIndex = 0;
        while (usedStacks.has(stackIndex)) {
          stackIndex++;
        }

        // Store this position permanently for this time
        stackPositionsRef.current.set(time, stackIndex);
      }

      groups.push({ time, words: sortedWords, stackIndex, opacity });
    });

    return groups;
  }, [contentMetaWordMemoized, currentTime, sentenceMapMemoized]);

  if (visibleWordGroups.length === 0) {
    return null;
  }

  return (
    <div className='absolute inset-0 pointer-events-none'>
      {visibleWordGroups.map((group, index) => {
        const surfaceForms = group.words.map((w) => w.surfaceForm).join(', ');
        const transliterations = group.words
          .map((w) => w.transliteration)
          .filter(Boolean)
          .join(', ');
        const uniqueBaseForms = Array.from(
          new Set(
            group.words
              .filter((w) => w.baseForm !== w.surfaceForm)
              .map((w) => w.baseForm),
          ),
        );

        return (
          <div
            key={`group-${group.time}-${index}`}
            className='absolute transition-all duration-300 ease-in-out'
            style={{
              top: `${10 + group.stackIndex * 80}px`,
              right: '10px',
              opacity: group.opacity,
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
        );
      })}
    </div>
  );
};

export default VideoOverlay;
