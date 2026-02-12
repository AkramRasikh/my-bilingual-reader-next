import { useMemo } from 'react';
import { SentenceMapItemTypes } from '../types/content-types';

interface UseCurrentSentenceArgs {
  currentTime: number;
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
}

export const useCurrentSentence = ({
  currentTime,
  sentenceMapMemoized,
}: UseCurrentSentenceArgs): SentenceMapItemTypes | null => {
  return useMemo(() => {
    const sentences = Object.values(sentenceMapMemoized);
    
    if (sentences.length === 0) {
      return null;
    }

    // Find the sentence whose time is closest to but not greater than currentTime
    const currentSentence = sentences
      .filter((sentence) => sentence.time <= currentTime)
      .sort((a, b) => b.time - a.time)[0];

    // Only return if we're within the sentence duration (before next sentence starts)
    if (currentSentence) {
      const nextSentence = sentences.find(
        (s) => s.time > currentSentence.time
      );
      
      // If there's a next sentence and we've passed it, return null
      if (nextSentence && currentTime >= nextSentence.time) {
        return null;
      }
      
      return currentSentence;
    }

    return null;
  }, [currentTime, sentenceMapMemoized]);
};
