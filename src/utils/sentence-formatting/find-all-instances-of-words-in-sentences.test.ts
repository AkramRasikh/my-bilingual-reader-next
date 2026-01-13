import { findAllInstancesOfWordsInSentence } from './find-all-instances-of-words-in-sentences';
import { WordTypes } from '@/app/types/word-types';

describe('findAllInstancesOfWordsInSentence', () => {
  const mockWordData: WordTypes = {
    id: '1',
    baseForm: 'run',
    surfaceForm: 'running',
    contexts: [],
    definition: 'to move fast',
    phonetic: 'rʌn',
    reviewData: {} as any,
    transliteration: '',
    originalContext: '',
    isDue: false,
  };

  const mockWordData2: WordTypes = {
    id: '2',
    baseForm: 'walk',
    surfaceForm: 'walked',
    contexts: [],
    definition: 'to move on foot',
    phonetic: 'wɔːk',
    reviewData: {} as any,
    transliteration: '',
    originalContext: '',
    isDue: false,
  };

  const mockWordData3: WordTypes = {
    id: '3',
    baseForm: 'jump',
    surfaceForm: 'jumping',
    contexts: [],
    definition: 'to leap',
    phonetic: 'dʒʌmp',
    reviewData: {} as any,
    transliteration: '',
    originalContext: '',
    isDue: false,
  };

  it('should return words that match baseForm in the sentence', () => {
    const sentence = 'I like to run every day';
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockWordData);
  });

  it('should return words that match surfaceForm in the sentence', () => {
    const sentence = 'I was running in the park';
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockWordData);
  });

  it('should return multiple matching words', () => {
    const sentence = 'I walked and then started running';
    const wordState = [mockWordData, mockWordData2];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(2);
    expect(result).toContain(mockWordData);
    expect(result).toContain(mockWordData2);
  });

  it('should return empty array when no words match', () => {
    const sentence = 'I like to swim every day';
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return empty array when wordState is empty', () => {
    const sentence = 'I like to run every day';
    const wordState: WordTypes[] = [];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return empty array when sentence is empty', () => {
    const sentence = '';
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle partial word matches', () => {
    const sentence = 'The runner is running';
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    // Should match because "running" is the surfaceForm
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockWordData);
  });

  it('should not return duplicate words when both baseForm and surfaceForm match', () => {
    const wordWithSameBaseSurface: WordTypes = {
      ...mockWordData,
      baseForm: 'run',
      surfaceForm: 'run',
    };

    const sentence = 'I run every day';
    const wordState = [wordWithSameBaseSurface];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(1);
  });

  it('should be case-sensitive', () => {
    const sentence = 'I like to Run every day';
    const wordState = [mockWordData]; // baseForm is 'run' (lowercase)

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    // Should not match because 'Run' !== 'run'
    expect(result).toHaveLength(0);
  });

  it('should handle multiple words where only some match', () => {
    const sentence = 'I walked yesterday';
    const wordState = [mockWordData, mockWordData2, mockWordData3];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockWordData2);
  });

  it('should handle special characters in sentence', () => {
    const sentence = "I'm running, aren't you?";
    const wordState = [mockWordData];

    const result = findAllInstancesOfWordsInSentence(sentence, wordState);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockWordData);
  });
});
