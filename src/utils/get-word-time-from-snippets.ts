import { WordTypes } from '@/app/types/word-types';
import { Snippet } from '@/app/types/content-types';

/**
 * Finds the most accurate time for a word based on overlapping snippets
 * Prefers non-preSnippets over preSnippets
 * @param word - The word to find timing for
 * @param snippets - Array of snippets to search through
 * @returns The calculated time or undefined if no match found
 */
export const getWordTimeFromSnippets = (
  word: WordTypes,
  snippets: Snippet[],
): number | undefined => {
  const matchesWord = (item: Snippet) =>
    item?.focusedText?.includes(word.surfaceForm) ||
    item?.focusedText?.includes(word.baseForm) ||
    item?.suggestedFocusText?.includes(word.surfaceForm) ||
    item?.suggestedFocusText?.includes(word.baseForm);

  // Try to find a non-preSnippet first
  let overlappedSnippet = snippets.find(
    (item) => matchesWord(item) && !item?.isPreSnippet,
  );

  // Fall back to any matching snippet (including preSnippets)
  if (!overlappedSnippet) {
    overlappedSnippet = snippets.find(matchesWord);
  }

  if (overlappedSnippet) {
    const time = overlappedSnippet.time;
    // Adjust time based on whether snippet is contracted
    return overlappedSnippet?.isContracted ? time - 0.75 : time - 1.5;
  }

  return undefined;
};
