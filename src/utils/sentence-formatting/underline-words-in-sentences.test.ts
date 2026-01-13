import { underlineWordsInSentence } from './underline-words-in-sentences';
import { WordTypes } from '@/app/types/word-types';

describe('underlineWordsInSentence', () => {
  const createMockWord = (
    id: string,
    baseForm: string,
    surfaceForm: string,
  ): WordTypes => ({
    id,
    baseForm,
    surfaceForm,
    contexts: [],
    definition: '',
    phonetic: '',
    reviewData: {} as any,
    transliteration: '',
    originalContext: '',
    isDue: false,
  });

  describe('1) standard wordtypes array given', () => {
    it('should mark single word occurrence with savedWords', () => {
      const sentence = 'I am running today';
      const words = [createMockWord('1', 'run', 'running')];

      const result = underlineWordsInSentence(sentence, words);

      const runningChunk = result.find((chunk) => chunk.text === 'running');
      console.log('## result', result);

      expect(runningChunk).toBeDefined();
      expect(runningChunk?.savedWords).toEqual(['1']);
    });

    it('should mark multiple different words', () => {
      const sentence = 'I like running and walking';
      const words = [
        createMockWord('1', 'run', 'running'),
        createMockWord('2', 'walk', 'walking'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const runningChunk = result.find((chunk) => chunk.text === 'running');
      const walkingChunk = result.find((chunk) => chunk.text === 'walking');

      expect(runningChunk?.savedWords).toEqual(['1']);
      expect(walkingChunk?.savedWords).toEqual(['2']);
    });

    it('should mark both baseForm and surfaceForm occurrences', () => {
      const sentence = 'I run when I am running';
      const words = [createMockWord('1', 'run', 'running')];

      const result = underlineWordsInSentence(sentence, words);

      const runChunk = result.find((chunk) => chunk.text === 'run');
      const runningChunk = result.find((chunk) => chunk.text === 'running');

      expect(runChunk?.savedWords).toEqual(['1']);
      expect(runningChunk?.savedWords).toEqual(['1']);
    });

    it('should handle multiple occurrences of the same word', () => {
      const sentence = 'run run run';
      const words = [createMockWord('1', 'run', 'run')];

      const result = underlineWordsInSentence(sentence, words);

      const runChunks = result.filter((chunk) => chunk.text === 'run');
      expect(runChunks).toHaveLength(3);
      runChunks.forEach((chunk) => {
        expect(chunk.savedWords).toEqual(['1']);
      });
    });
  });

  describe('2) wordtypes of non matching given', () => {
    it('should return sentence with empty savedWords when no words match', () => {
      const sentence = 'I am swimming';
      const words = [createMockWord('1', 'run', 'running')];

      const result = underlineWordsInSentence(sentence, words);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('I am swimming');
      expect(result[0].savedWords).toEqual([]);
    });

    it('should only mark matching words when some words do not match', () => {
      const sentence = 'I am running';
      const words = [
        createMockWord('1', 'run', 'running'),
        createMockWord('2', 'walk', 'walking'),
        createMockWord('3', 'swim', 'swimming'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const runningChunk = result.find((chunk) => chunk.text === 'running');
      const unmarkedChunks = result.filter(
        (chunk) => chunk.savedWords.length === 0,
      );

      expect(runningChunk?.savedWords).toEqual(['1']);
      expect(unmarkedChunks.length).toBeGreaterThan(0);
    });
  });

  describe('3) overlapping chunks', () => {
    it('should handle complete word overlap', () => {
      const sentence = 'running';
      const words = [
        createMockWord('1', 'run', 'run'),
        createMockWord('2', 'running', 'running'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      // "run" at the start overlaps with "running"
      // Characters 0-2 should have both word IDs
      const runChunk = result.find(
        (chunk) => chunk.savedWords.length === 2 && chunk.text === 'run',
      );
      const ningChunk = result.find((chunk) => chunk.text === 'ning');

      expect(runChunk?.savedWords).toContain('1');
      expect(runChunk?.savedWords).toContain('2');
      expect(ningChunk?.savedWords).toEqual(['2']);
    });

    it('should handle partial word overlap', () => {
      const sentence = 'understand';
      const words = [
        createMockWord('1', 'under', 'under'),
        createMockWord('2', 'stand', 'stand'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const underChunk = result.find((chunk) => chunk.text === 'under');
      const standChunk = result.find((chunk) => chunk.text === 'stand');

      expect(underChunk?.savedWords).toEqual(['1']);
      expect(standChunk?.savedWords).toEqual(['2']);
    });

    it('should handle words contained within other words', () => {
      const sentence = 'runner';
      const words = [
        createMockWord('1', 'run', 'run'),
        createMockWord('2', 'runner', 'runner'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const runChunk = result.find(
        (chunk) => chunk.savedWords.length === 2 && chunk.text === 'run',
      );
      const nerChunk = result.find((chunk) => chunk.text === 'ner');

      expect(runChunk?.savedWords).toContain('1');
      expect(runChunk?.savedWords).toContain('2');
      expect(nerChunk?.savedWords).toEqual(['2']);
    });
  });

  describe('4) non overlapping chunks', () => {
    it('should create separate chunks for non-overlapping words', () => {
      const sentence = 'I like cats and dogs';
      const words = [
        createMockWord('1', 'cat', 'cats'),
        createMockWord('2', 'dog', 'dogs'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const catsChunk = result.find((chunk) => chunk.text === 'cats');
      const dogsChunk = result.find((chunk) => chunk.text === 'dogs');

      expect(catsChunk?.savedWords).toEqual(['1']);
      expect(dogsChunk?.savedWords).toEqual(['2']);

      // Verify there are unmarked chunks between them
      const unmarkedChunks = result.filter(
        (chunk) => chunk.savedWords.length === 0,
      );
      expect(unmarkedChunks.length).toBeGreaterThan(0);
    });

    it('should preserve spacing between non-overlapping words', () => {
      const sentence = 'run fast';
      const words = [
        createMockWord('1', 'run', 'run'),
        createMockWord('2', 'fast', 'fast'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      expect(result).toHaveLength(3); // 'run', ' ', 'fast'
      expect(result[0].text).toBe('run');
      expect(result[0].savedWords).toEqual(['1']);
      expect(result[1].text).toBe(' ');
      expect(result[1].savedWords).toEqual([]);
      expect(result[2].text).toBe('fast');
      expect(result[2].savedWords).toEqual(['2']);
    });
  });

  describe('5) sporadic + overlapping', () => {
    it('should handle complex mix of overlapping and non-overlapping words', () => {
      const sentence = 'I understand running quickly';
      const words = [
        createMockWord('1', 'under', 'under'),
        createMockWord('2', 'stand', 'stand'),
        createMockWord('3', 'run', 'running'),
        createMockWord('4', 'quick', 'quickly'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      // "understand" has overlapping "under" and "stand"
      const underChunk = result.find((chunk) => chunk.text === 'under');
      const standChunk = result.find((chunk) => chunk.text === 'stand');

      // "running" and "quickly" are separate
      const runningChunk = result.find((chunk) => chunk.text === 'running');
      const quicklyChunk = result.find((chunk) => chunk.text === 'quickly');

      expect(underChunk?.savedWords).toEqual(['1']);
      expect(standChunk?.savedWords).toEqual(['2']);
      expect(runningChunk?.savedWords).toEqual(['3']);
      expect(quicklyChunk?.savedWords).toEqual(['4']);
    });

    it('should handle multiple overlapping words with gaps', () => {
      const sentence = 'runner walks slowly';
      const words = [
        createMockWord('1', 'run', 'run'),
        createMockWord('2', 'runner', 'runner'),
        createMockWord('3', 'walk', 'walks'),
        createMockWord('4', 'slow', 'slowly'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      // "runner" overlaps with "run"
      const runChunk = result.find(
        (chunk) => chunk.text === 'run' && chunk.savedWords.length === 2,
      );
      expect(runChunk?.savedWords).toContain('1');
      expect(runChunk?.savedWords).toContain('2');

      // "walks" and "slowly" are separate
      const walksChunk = result.find((chunk) => chunk.text === 'walks');
      const slowlyChunk = result.find((chunk) => chunk.text === 'slowly');
      expect(walksChunk?.savedWords).toEqual(['3']);
      expect(slowlyChunk?.savedWords).toEqual(['4']);
    });

    it('should handle sentence with mixed marked and unmarked segments', () => {
      const sentence = 'The runner is running very fast today';
      const words = [
        createMockWord('1', 'run', 'run'),
        createMockWord('2', 'runner', 'runner'),
        createMockWord('3', 'fast', 'fast'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const markedChunks = result.filter(
        (chunk) => chunk.savedWords.length > 0,
      );
      const unmarkedChunks = result.filter(
        (chunk) => chunk.savedWords.length === 0,
      );

      expect(markedChunks.length).toBeGreaterThan(0);
      expect(unmarkedChunks.length).toBeGreaterThan(0);

      // Verify complete sentence reconstruction
      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });
  });

  describe('edge cases', () => {
    it('should return sentence with empty savedWords when wordtypes array is empty', () => {
      const sentence = 'Hello world';
      const words: WordTypes[] = [];

      const result = underlineWordsInSentence(sentence, words);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Hello world');
      expect(result[0].savedWords).toEqual([]);
    });

    it('should handle empty sentence', () => {
      const sentence = '';
      const words = [createMockWord('1', 'run', 'running')];

      const result = underlineWordsInSentence(sentence, words);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('');
      expect(result[0].savedWords).toEqual([]);
    });

    it('should handle single character words', () => {
      const sentence = 'I am a person';
      const words = [
        createMockWord('1', 'I', 'I'),
        createMockWord('2', 'a', 'a'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const iChunk = result.find(
        (chunk) => chunk.text === 'I' && chunk.savedWords.length > 0,
      );
      const aChunk = result.find(
        (chunk) => chunk.text === 'a' && chunk.savedWords.length > 0,
      );

      expect(iChunk?.savedWords).toEqual(['1']);
      expect(aChunk?.savedWords).toEqual(['2']);
    });

    it('should always reconstruct the original sentence', () => {
      const sentence = 'Complex sentence with running, walking, and standing';
      const words = [
        createMockWord('1', 'run', 'running'),
        createMockWord('2', 'walk', 'walking'),
        createMockWord('3', 'stand', 'standing'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });
  });

  describe('Japanese language tests', () => {
    it('should handle Japanese hiragana characters', () => {
      const sentence = '私は走っています';
      const words = [
        createMockWord('1', '走る', '走って'),
        createMockWord('2', '私', '私'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const watashiChunk = result.find((chunk) => chunk.text === '私');
      const hashitteChunk = result.find((chunk) => chunk.text === '走って');

      expect(watashiChunk?.savedWords).toEqual(['2']);
      expect(hashitteChunk?.savedWords).toEqual(['1']);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });

    it('should handle mixed Japanese scripts (hiragana, katakana, kanji)', () => {
      const sentence = '今日はコーヒーを飲みます';
      const words = [
        createMockWord('1', '今日', '今日'),
        createMockWord('2', 'コーヒー', 'コーヒー'),
        createMockWord('3', '飲む', '飲み'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const kyoChunk = result.find((chunk) => chunk.text === '今日');
      const coffeeChunk = result.find((chunk) => chunk.text === 'コーヒー');
      const nomiChunk = result.find((chunk) => chunk.text === '飲み');

      expect(kyoChunk?.savedWords).toEqual(['1']);
      expect(coffeeChunk?.savedWords).toEqual(['2']);
      expect(nomiChunk?.savedWords).toEqual(['3']);
    });

    it('should handle Japanese verb conjugations', () => {
      const sentence = '食べた食べる食べます';
      const words = [createMockWord('1', '食べる', '食べ')];

      const result = underlineWordsInSentence(sentence, words);

      const tabeChunks = result.filter((chunk) =>
        chunk.savedWords.includes('1'),
      );
      expect(tabeChunks.length).toBeGreaterThan(0);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });

    it('should handle overlapping Japanese words', () => {
      const sentence = '食べ物';
      const words = [
        createMockWord('1', '食べる', '食べ'),
        createMockWord('2', '食べ物', '食べ物'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const tabeChunk = result.find(
        (chunk) => chunk.text === '食べ' && chunk.savedWords.length === 2,
      );
      const monoChunk = result.find((chunk) => chunk.text === '物');

      expect(tabeChunk?.savedWords).toContain('1');
      expect(tabeChunk?.savedWords).toContain('2');
      expect(monoChunk?.savedWords).toEqual(['2']);
    });
  });

  xdescribe('Arabic language tests', () => {
    it('should handle Arabic text (RTL)', () => {
      const sentence = 'أنا أركض اليوم';
      const words = [
        createMockWord('1', 'أركض', 'أركض'),
        createMockWord('2', 'أنا', 'أنا'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const anaChunk = result.find((chunk) => chunk.text === 'أنا');
      const arkudChunk = result.find((chunk) => chunk.text === 'أركض');

      expect(anaChunk?.savedWords).toEqual(['2']);
      expect(arkudChunk?.savedWords).toEqual(['1']);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });

    it('should handle Arabic verb forms', () => {
      const sentence = 'يكتب كتب كاتب';
      const words = [
        createMockWord('1', 'كتب', 'كتب'),
        createMockWord('2', 'يكتب', 'يكتب'),
        createMockWord('3', 'كاتب', 'كاتب'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const yaktubChunk = result.find((chunk) => chunk.text === 'يكتب');
      const katabaChunk = result.find((chunk) => chunk.text === 'كتب');
      const katibChunk = result.find((chunk) => chunk.text === 'كاتب');

      expect(yaktubChunk?.savedWords).toEqual(['2']);
      expect(katabaChunk?.savedWords).toEqual(['1']);
      expect(katibChunk?.savedWords).toEqual(['3']);
    });

    it('should handle Arabic with diacritics', () => {
      const sentence = 'كَتَبَ الطَّالِبُ';
      const words = [
        createMockWord('1', 'كَتَبَ', 'كَتَبَ'),
        createMockWord('2', 'الطَّالِبُ', 'الطَّالِبُ'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const katabaChunk = result.find((chunk) => chunk.text === 'كَتَبَ');
      const studentChunk = result.find((chunk) => chunk.text === 'الطَّالِبُ');

      expect(katabaChunk?.savedWords).toEqual(['1']);
      expect(studentChunk?.savedWords).toEqual(['2']);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });

    it('should handle Arabic text with overlapping roots', () => {
      const sentence = 'كتابة';
      const words = [
        createMockWord('1', 'كتب', 'كتب'),
        createMockWord('2', 'كتابة', 'كتابة'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const ktbChunk = result.find(
        (chunk) => chunk.text === 'كتب' && chunk.savedWords.length === 2,
      );
      const abaChunk = result.find((chunk) => chunk.text === 'ابة');

      expect(ktbChunk?.savedWords).toContain('1');
      expect(ktbChunk?.savedWords).toContain('2');
      expect(abaChunk?.savedWords).toEqual(['2']);
    });

    it('should handle mixed Arabic and English text', () => {
      const sentence = 'أنا أحب JavaScript';
      const words = [
        createMockWord('1', 'أحب', 'أحب'),
        createMockWord('2', 'JavaScript', 'JavaScript'),
      ];

      const result = underlineWordsInSentence(sentence, words);

      const ahebChunk = result.find((chunk) => chunk.text === 'أحب');
      const jsChunk = result.find((chunk) => chunk.text === 'JavaScript');

      expect(ahebChunk?.savedWords).toEqual(['1']);
      expect(jsChunk?.savedWords).toEqual(['2']);

      const reconstructed = result.map((chunk) => chunk.text).join('');
      expect(reconstructed).toBe(sentence);
    });
  });
});
