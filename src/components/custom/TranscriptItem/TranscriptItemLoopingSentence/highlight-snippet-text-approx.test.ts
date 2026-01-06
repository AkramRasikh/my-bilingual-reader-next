import { describe, it, expect } from '@jest/globals';
import { highlightSnippetTextApprox } from './highlight-snippet-text-approx';

describe('highlightSnippetTextApprox', () => {
  describe('exact match scenarios', () => {
    it('should find and highlight exact match with no index adjustments', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quick brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('quick brown');
      expect(result.htmlText).toContain('highlighted-snippet-text');
      expect(result.htmlText).toContain('bg-yellow-200');
      expect(result.matchStartKey).toBe(4); // Position of 'quick'
      expect(result.matchEndKey).toBe(15); // End position
    });

    it('should find match at the start of text', () => {
      const fullText = 'Hello world from testing';
      const slicedText = 'Hello';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('Hello');
      expect(result.matchStartKey).toBe(0);
    });

    it('should find match at the end of text', () => {
      const fullText = 'This is the end';
      const slicedText = 'end';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('end');
      expect(result.htmlText).toContain('end</span>');
    });
  });

  describe('startIndexKeyState adjustments (shifting left/right)', () => {
    it('should shift match to the right with positive startIndexKeyState', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        3,
        0,
      );

      // Original match starts at 4, shifted by +3 = 7
      expect(result.matchStartKey).toBe(7);
      expect(result.textMatch).toBe('ck brown');
    });

    it('should shift match to the left with negative startIndexKeyState', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        -2,
        0,
      );

      // Original match starts at 4, shifted by -2 = 2
      expect(result.matchStartKey).toBe(2);
      expect(result.textMatch).toBe('e quick brown');
    });

    it('should handle large positive shift', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        10,
        0,
      );

      expect(result.matchStartKey).toBe(14);
      expect(result.textMatch.length).toBeGreaterThan(0);
    });
  });

  describe('endIndexKeyState adjustments (expanding/contracting)', () => {
    it('should expand match to the right with positive endIndexKeyState', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick brown';

      const resultBase = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );
      const resultExpanded = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        5,
      );

      expect(resultExpanded.textMatch.length).toBeGreaterThan(
        resultBase.textMatch.length,
      );
      expect(resultExpanded.textMatch).toBe('quick brown fox');
    });

    it('should contract match with negative endIndexKeyState', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick brown';

      const resultBase = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );
      const resultContracted = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        -5,
      );

      expect(resultContracted.textMatch.length).toBeLessThan(
        resultBase.textMatch.length,
      );
      expect(resultContracted.textMatch).toBe('quick ');
    });

    it('should handle extreme contraction', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'quick brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        -10,
      );

      // Should contract significantly
      expect(result.textMatch.length).toBeLessThan(slicedText.length);
    });

    it('should handle extreme expansion', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        20,
      );

      // Should expand beyond original match
      expect(result.textMatch.length).toBeGreaterThan(slicedText.length);
    });
  });

  describe('combined startIndexKeyState and endIndexKeyState', () => {
    it('should shift left and expand right', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'brown fox';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        -2,
        5,
      );

      // Should start earlier and end later
      expect(result.textMatch).toContain('brown fox');
      expect(result.textMatch.length).toBeGreaterThan(slicedText.length);
    });

    it('should shift right and contract', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quick brown fox';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        3,
        -5,
      );

      // Should start later and be shorter
      expect(result.textMatch.length).toBeLessThan(slicedText.length);
    });

    it('should handle both negative shifts', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'brown fox jumps';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        -3,
        -3,
      );

      // Should shift left and contract
      expect(result.matchStartKey).toBeLessThan(10); // Original position minus shift
    });

    it('should handle both positive shifts', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        2,
        8,
      );

      // Should shift right and expand
      expect(result.matchStartKey).toBe(6);
      expect(result.textMatch.length).toBeGreaterThan(slicedText.length);
    });
  });

  describe('loading state', () => {
    it('should add opacity-50 class when loading state is true', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        true,
        0,
        0,
      );

      expect(result.htmlText).toContain('opacity-50');
    });

    it('should not add opacity class when loading state is false', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.htmlText).not.toContain('opacity-50');
    });
  });

  describe('fuzzy matching fallback', () => {
    it('should find approximate match when exact match not found', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quikc brown'; // Typo: 'quikc' instead of 'quick'

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      // Should still find a match using fuzzy logic
      expect(result.textMatch).toBeTruthy();
      expect(result.textMatch).toContain('quick');
    });

    it('should handle multiple character differences within threshold', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'quck brwn fox'; // Multiple typos

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      // Should find approximate match
      expect(result.textMatch.length).toBeGreaterThan(0);
    });

    it('should return original text when no suitable fuzzy match found', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'completely different text that will not match';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result).toBe(fullText);
    });

    it('should return original text for very low similarity score', () => {
      const fullText = 'abcdefghijklmnop';
      const slicedText = 'zyxwvutsrqponmlk';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result).toBe(fullText);
    });
  });

  describe('HTML structure', () => {
    it('should include correct span attributes', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.htmlText).toContain(
        'data-testid="highlighted-snippet-text"',
      );
      expect(result.htmlText).toContain(
        'class="bg-yellow-200 shadow-yellow-500 shadow-sm px-1 rounded',
      );
    });

    it('should maintain text before and after highlighted section', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.htmlText).toContain('The quick ');
      expect(result.htmlText).toContain(' fox jumps');
    });

    it('should properly close span tags', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      const openSpans = (result.htmlText.match(/<span/g) || []).length;
      const closeSpans = (result.htmlText.match(/<\/span>/g) || []).length;

      expect(openSpans).toBe(closeSpans);
    });
  });

  describe('edge cases', () => {
    it('should handle empty sliced text', () => {
      const fullText = 'The quick brown fox';
      const slicedText = '';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result).toBe(fullText);
    });

    it('should handle single character match', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'q';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('q');
      expect(result.htmlText).toContain('highlighted-snippet-text');
    });

    it('should handle full text match', () => {
      const fullText = 'The quick brown fox';
      const slicedText = 'The quick brown fox';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe(fullText);
      expect(result.matchStartKey).toBe(0);
    });

    it('should handle special characters in text', () => {
      const fullText = 'Hello, world! How are you?';
      const slicedText = 'world!';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('world!');
    });

    it('should handle unicode characters', () => {
      const fullText = 'こんにちは世界 Hello world';
      const slicedText = 'こんにちは';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.textMatch).toBe('こんにちは');
    });

    it('should handle repeated patterns', () => {
      const fullText = 'the the the the the';
      const slicedText = 'the';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      // Should find first occurrence
      expect(result.matchStartKey).toBe(0);
      expect(result.textMatch).toBe('the');
    });
  });

  describe('metadata accuracy', () => {
    it('should return correct matchStartKey and matchEndKey', () => {
      const fullText = 'The quick brown fox jumps over the lazy dog';
      const slicedText = 'fox jumps';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        0,
      );

      expect(result.matchStartKey).toBe(16);
      expect(result.matchEndKey).toBe(25);
      expect(fullText.substring(result.matchStartKey, result.matchEndKey)).toBe(
        result.textMatch,
      );
    });

    it('should return correct metadata with positive startIndexKeyState', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick brown';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        5,
        0,
      );

      expect(result.matchStartKey).toBe(9);
      expect(fullText.substring(result.matchStartKey, result.matchEndKey)).toBe(
        result.textMatch,
      );
    });

    it('should return correct metadata with endIndexKeyState adjustments', () => {
      const fullText = 'The quick brown fox jumps';
      const slicedText = 'quick';

      const result = highlightSnippetTextApprox(
        fullText,
        slicedText,
        false,
        0,
        7,
      );

      expect(fullText.substring(result.matchStartKey, result.matchEndKey)).toBe(
        result.textMatch,
      );
    });
  });
});
