import { describe, it, expect } from '@jest/globals';
import { sliceTranscriptViaPercentageOverlap } from './slice-transcript-via-percentage-overlap';
import { OverlappingSnippetData } from '@/app/types/shared-types';

describe('sliceTranscriptViaPercentageOverlap', () => {
  it('should extract a small portion of text within one sentence', () => {
    // Single sentence: "The quick brown fox jumps" (25 chars)
    // Extract from 20% to 60% (5 chars start, 10 chars extracted)
    const items: OverlappingSnippetData[] = [
      {
        id: '1',
        start: 0,
        end: 2,
        percentageOverlap: 40, // 40% of the sentence
        targetLang: 'The quick brown fox jumps',
        startPoint: 20, // Start at 20% into the sentence
      },
    ];

    const result = sliceTranscriptViaPercentageOverlap(items);

    // startIndex = floor(25 * 0.20) = floor(5) = 5
    // endIndex = floor(25 * 0.40) + 5 = floor(10) + 5 = 15
    // text.substring(5, 15) = "uick brown"
    expect(result).toBe('uick brown');
  });

  it('should extract overlapping text from two sentences that overlap halfway', () => {
    // Simulating a time range that captures:
    // First sentence: "Hello world" (11 chars)
    // - Starts at 50% into the sentence, takes remaining 50% to end (startPoint: 50, overlap: 50)
    // Second sentence: "Goodbye friend" (14 chars)
    // - Starts at beginning, takes first 50% (startPoint: 0, overlap: 50)
    const items: OverlappingSnippetData[] = [
      {
        id: '1',
        start: 0,
        end: 2,
        percentageOverlap: 50, // Takes the remaining 50% from startPoint to end
        targetLang: 'Hello world',
        startPoint: 50, // Starts halfway through the sentence
      },
      {
        id: '2',
        start: 2,
        end: 4,
        percentageOverlap: 50, // Takes first 50% of this sentence
        targetLang: 'Goodbye friend',
        startPoint: 0, // Starts at beginning
      },
    ];

    const result = sliceTranscriptViaPercentageOverlap(items);

    // First: startIndex = floor(11 * 0.50) = 5, endIndex = floor(11 * 0.50) + 5 = 10
    // text.substring(5, 10) = " worl"
    // Second: startIndex = floor(14 * 0) = 0, endIndex = floor(14 * 0.50) + 0 = 7
    // text.substring(0, 7) = "Goodbye"
    expect(result).toBe(' worlGoodbye');
  });

  it('should extract from three sentences with varying overlap amounts', () => {
    // Simulating a time range (e.g., 2.4s to 5.8s across sentences):
    // First sentence: "First sentence here" (19 chars)
    // - Starts at 80% into sentence, takes remaining 20% to end (startPoint: 80, overlap: 20)
    // Second sentence: "Second one now" (14 chars)
    // - Captures entire sentence (startPoint: 0, overlap: 100)
    // Third sentence: "Third and final text" (20 chars)
    // - Starts at beginning, takes first 30% (startPoint: 0, overlap: 30)
    const items: OverlappingSnippetData[] = [
      {
        id: '1',
        start: 0,
        end: 2,
        percentageOverlap: 20, // Takes the remaining 20% from startPoint to end
        targetLang: 'First sentence here',
        startPoint: 80, // Starts 80% into the sentence
      },
      {
        id: '2',
        start: 2,
        end: 4,
        percentageOverlap: 100, // Takes entire sentence
        targetLang: 'Second one now',
        startPoint: 0,
      },
      {
        id: '3',
        start: 4,
        end: 6,
        percentageOverlap: 30, // Takes first 30% of sentence
        targetLang: 'Third and final text',
        startPoint: 0,
      },
    ];

    const result = sliceTranscriptViaPercentageOverlap(items);

    // First: startIndex = floor(19 * 0.80) = floor(15.2) = 15, endIndex = floor(19 * 0.20) + 15 = 3 + 15 = 18
    // text.substring(15, 18) = "her"
    // Second: startIndex = floor(14 * 0) = 0, endIndex = floor(14 * 1.00) + 0 = 14
    // text.substring(0, 14) = "Second one now"
    // Third: startIndex = floor(20 * 0) = 0, endIndex = floor(20 * 0.30) + 0 = 6
    // text.substring(0, 6) = "Third "
    expect(result).toBe('herSecond one nowThird ');
  });

  it('should concatenate Japanese sentences without spaces when addSentenceSpace is false', () => {
    // Japanese text doesn't use spaces between words/sentences
    const items: OverlappingSnippetData[] = [
      {
        id: '1',
        start: 0,
        end: 2,
        percentageOverlap: 100,
        targetLang: 'これは最初の文です',
        startPoint: 0,
      },
      {
        id: '2',
        start: 2,
        end: 4,
        percentageOverlap: 100,
        targetLang: 'これは二番目の文です',
        startPoint: 0,
      },
    ];

    const result = sliceTranscriptViaPercentageOverlap(items, false);

    // Should concatenate directly without spaces
    expect(result).toBe('これは最初の文ですこれは二番目の文です');
  });

  it('should add spaces between French sentences when addSentenceSpace is true', () => {
    // French text needs spaces between sentences for proper readability
    const items: OverlappingSnippetData[] = [
      {
        id: '1',
        start: 0,
        end: 2,
        percentageOverlap: 50,
        targetLang: 'Bonjour le monde',
        startPoint: 50,
      },
      {
        id: '2',
        start: 2,
        end: 4,
        percentageOverlap: 100,
        targetLang: 'Comment allez-vous',
        startPoint: 0,
      },
      {
        id: '3',
        start: 4,
        end: 6,
        percentageOverlap: 40,
        targetLang: 'Merci beaucoup',
        startPoint: 0,
      },
    ];

    const result = sliceTranscriptViaPercentageOverlap(items, true);

    // First: startIndex = floor(17 * 0.50) = 8, endIndex = floor(17 * 0.50) + 8 = 16
    // text.substring(8, 16) = "le monde"
    // Second: startIndex = 0, endIndex = floor(18 * 1.00) = 18
    // text.substring(0, 18) = "Comment allez-vous"
    // Third: startIndex = 0, endIndex = floor(15 * 0.40) = 6
    // text.substring(0, 6) = "Merci "
    // Each should have a space appended
    expect(result).toBe('le monde Comment allez-vous Merci ');
  });
});
