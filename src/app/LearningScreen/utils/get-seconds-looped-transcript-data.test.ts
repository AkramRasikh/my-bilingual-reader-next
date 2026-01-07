import { describe, it, expect } from '@jest/globals';
import { getSecondsLoopedTranscriptData } from './get-seconds-looped-transcript-data';
import { SentenceMapItemTypes } from '@/app/types/content-types';

describe('getSecondsLoopedTranscriptData', () => {
  it('should return an empty array when formattedTranscriptState is empty', () => {
    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: [],
      loopStartTime: 0,
      loopEndTime: 10,
      mediaDuration: 100,
    });

    expect(result).toEqual([]);
  });

  it('should return all elements when loop time overlaps with all transcript items', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 5,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '2',
        time: 5,
        nextSentence: 10,
        targetLang: 'Second sentence',
        baseLang: 'Segunda frase',
        index: 1,
        prevSentence: 0,
        thisSentence: 5,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Second sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '3',
        time: 10,
        nextSentence: 15,
        targetLang: 'Third sentence',
        baseLang: 'Tercera frase',
        index: 2,
        prevSentence: 5,
        thisSentence: 10,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Third sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 0,
      loopEndTime: 15,
      mediaDuration: 100,
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      {
        id: '1',
        start: 0,
        end: 5,
        percentageOverlap: 100,
        targetLang: 'First sentence',
        startPoint: 0,
      },
      {
        id: '2',
        start: 5,
        end: 10,
        percentageOverlap: 100,
        targetLang: 'Second sentence',
        startPoint: 0,
      },
      {
        id: '3',
        start: 10,
        end: 15,
        percentageOverlap: 100,
        targetLang: 'Third sentence',
        startPoint: 0,
      },
    ]);
  });

  it('should return partial overlap with correct percentage calculations', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 10,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '2',
        time: 10,
        nextSentence: 20,
        targetLang: 'Second sentence',
        baseLang: 'Segunda frase',
        index: 1,
        prevSentence: 0,
        thisSentence: 10,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Second sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    // Loop from 5 to 15, which overlaps:
    // - First sentence: 5s to 10s (5s out of 10s duration = 50%)
    // - Second sentence: 10s to 15s (5s out of 10s duration = 50%)
    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 5,
      loopEndTime: 15,
      mediaDuration: 100,
    });

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        id: '1',
        start: 0,
        end: 10,
        percentageOverlap: 50,
        targetLang: 'First sentence',
        startPoint: 50, // Starts at 50% into the sentence (5s / 10s)
      },
      {
        id: '2',
        start: 10,
        end: 20,
        percentageOverlap: 50,
        targetLang: 'Second sentence',
        startPoint: 0, // Starts at beginning of sentence
      },
    ]);
  });

  it('should return fewer elements when some items do not overlap with loop time', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 5,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '2',
        time: 5,
        nextSentence: 10,
        targetLang: 'Second sentence',
        baseLang: 'Segunda frase',
        index: 1,
        prevSentence: 0,
        thisSentence: 5,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Second sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '3',
        time: 20,
        nextSentence: 25,
        targetLang: 'Third sentence',
        baseLang: 'Tercera frase',
        index: 2,
        prevSentence: 10,
        thisSentence: 20,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Third sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    // Loop from 0 to 10, only overlaps with first two sentences
    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 0,
      loopEndTime: 10,
      mediaDuration: 100,
    });

    expect(result).toHaveLength(2);
    expect(result?.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('should not return last element when it has no nextSentence and mediaDuration is null', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 5,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '2',
        time: 5,
        nextSentence: null,
        targetLang: 'Last sentence without end',
        baseLang: 'Última frase sin fin',
        index: 1,
        prevSentence: 0,
        thisSentence: 5,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Last sentence without end',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 0,
      loopEndTime: 10,
      mediaDuration: null, // No media duration available
    });

    // Only the first element should be returned, not the last one without end time
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        id: '1',
        start: 0,
        end: 5,
        percentageOverlap: 100,
        targetLang: 'First sentence',
        startPoint: 0,
      },
    ]);
  });

  it('should return last element when it has no nextSentence but mediaDuration is provided', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 5,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
      {
        id: '2',
        time: 5,
        nextSentence: null,
        targetLang: 'Last sentence',
        baseLang: 'Última frase',
        index: 1,
        prevSentence: 0,
        thisSentence: 5,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'Last sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 0,
      loopEndTime: 15,
      mediaDuration: 15, // Media duration provided
    });

    // Both elements should be returned, last one using mediaDuration as end
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        id: '1',
        start: 0,
        end: 5,
        percentageOverlap: 100,
        targetLang: 'First sentence',
        startPoint: 0,
      },
      {
        id: '2',
        start: 5,
        end: 15, // Uses mediaDuration
        percentageOverlap: 100,
        targetLang: 'Last sentence',
        startPoint: 0,
      },
    ]);
  });

  it('should handle edge case where loop time is completely outside transcript range', () => {
    const mockTranscript: SentenceMapItemTypes[] = [
      {
        id: '1',
        time: 0,
        nextSentence: 5,
        targetLang: 'First sentence',
        baseLang: 'Primera frase',
        index: 0,
        prevSentence: null,
        thisSentence: 0,
        isUpForReview: false,
        dueStatus: '',
        isDue: false,
        targetLangformatted: 'First sentence',
        wordsFromSentence: [],
      } as SentenceMapItemTypes,
    ];

    const result = getSecondsLoopedTranscriptData({
      formattedTranscriptState: mockTranscript,
      loopStartTime: 10,
      loopEndTime: 20,
      mediaDuration: 100,
    });

    expect(result).toEqual([]);
  });
});
