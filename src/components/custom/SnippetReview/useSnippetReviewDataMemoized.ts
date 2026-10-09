import { useMemo } from 'react';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { Snippet, ContentTranscriptTypes } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';

type VocabSpanItem = {
  surfaceForm?: string;
  meaning?: string;
  sentenceId?: string;
};

type CharacterWithVocab<T> = T & {
  startIndex?: number;
  surfaceForm?: string;
  meaning?: string;
  sentenceId?: string;
  secondForIndex?: number;
};

export function assignVocabSpans<T extends { text: string }>(
  characters: T[],
  vocab: VocabSpanItem[] | undefined,
  secondForIndex?: (index: number) => number | false | null,
): CharacterWithVocab<T>[] {
  const withVocab: CharacterWithVocab<T>[] = characters.map((character) => ({
    ...character,
  }));
  if (!vocab || vocab.length === 0) return withVocab;

  const claimed = new Array<boolean>(withVocab.length).fill(false);
  const placements = vocab
    .map((item, vocabIdx) => ({ item, vocabIdx }))
    .filter(({ item }) => Boolean(item.surfaceForm))
    .sort(
      (a, b) =>
        (b.item.surfaceForm?.length ?? 0) - (a.item.surfaceForm?.length ?? 0) ||
        a.vocabIdx - b.vocabIdx,
    );

  placements.forEach(({ item, vocabIdx }) => {
    const surfaceForm = item.surfaceForm ?? '';
    for (let start = 0; start <= withVocab.length - surfaceForm.length; start++) {
      let match = true;
      for (let offset = 0; offset < surfaceForm.length; offset++) {
        if (
          claimed[start + offset] ||
          withVocab[start + offset]?.text !== surfaceForm[offset]
        ) {
          match = false;
          break;
        }
      }
      if (!match) continue;

      for (let offset = 0; offset < surfaceForm.length; offset++) {
        const index = start + offset;
        claimed[index] = true;
        const secondForIndexValue = secondForIndex?.(index);
        withVocab[index] = {
          ...withVocab[index],
          startIndex: vocabIdx,
          surfaceForm,
          meaning: item.meaning,
          ...(typeof secondForIndexValue === 'number'
            ? { secondForIndex: secondForIndexValue }
            : {}),
          ...(item.sentenceId ? { sentenceId: item.sentenceId } : {}),
        };
      }
      break;
    }
  });

  return withVocab;
}

interface UseSnippetReviewDataMemoizedArgs {
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
  wordsState: WordTypes[];
  matchStartKey: number;
  matchEndKey: number;
  isReadyForQuickReview: boolean;
  getSecondForIndex: (index: number) => number | null;
}

export function useSnippetReviewDataMemoized({
  snippetData,
  wordsState,
  matchStartKey,
  matchEndKey,
  isReadyForQuickReview,
  getSecondForIndex,
}: UseSnippetReviewDataMemoizedArgs) {
  return useMemo(() => {
    const wordsInSuggestedText = findAllInstancesOfWordsInSentence(
      snippetData?.focusedText || snippetData?.suggestedFocusText || '',
      wordsState,
    );

    const wordsFromSentence = findAllInstancesOfWordsInSentence(
      snippetData.targetLang,
      wordsState,
    );

    const targetLangformatted = underlineWordsInSentence(
      snippetData.targetLang,
      wordsFromSentence,
      true,
    );

    const targetLangWithVocabStartIndex = assignVocabSpans(
      targetLangformatted,
      snippetData.vocab,
      (index) =>
        isReadyForQuickReview ? Number(getSecondForIndex(index)) : false,
    );

    const sentencesToBreakdownMap = new Map();
    targetLangWithVocabStartIndex.forEach((item, idx) => {
      if (item.sentenceId && !sentencesToBreakdownMap.has(item.sentenceId)) {
        sentencesToBreakdownMap.set(item.sentenceId, {
          startIndex: item.startIndex,
          surfaceForm: item.surfaceForm,
          meaning: item.meaning,
        });
      }
    });
    const sentencesToBreakdown = Array.from(
      sentencesToBreakdownMap.entries(),
    ).map(([sentenceId, { startIndex, surfaceForm }]) => ({
      sentenceId,
      startIndex,
      surfaceForm,
    }));

    return {
      targetLangformatted,
      wordsFromSentence,
      wordsInSuggestedText,
      targetLangWithVocabStartIndex,
      sentencesToBreakdown,
    };
  }, [snippetData, wordsState, matchStartKey, matchEndKey]);
}
