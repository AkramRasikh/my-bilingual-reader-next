import { useMemo } from 'react';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { Snippet, ContentTranscriptTypes } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';

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

    let targetLangWithVocabStartIndex = [...targetLangformatted];
    if (snippetData.vocab && snippetData.vocab.length > 0) {
      snippetData.vocab.forEach((vocabItem, vocabIdx) => {
        const { surfaceForm, sentenceId, meaning } = vocabItem;
        if (!surfaceForm) return;
        let start = 0;
        while (start < targetLangformatted.length) {
          let match = true;
          for (let j = 0; j < surfaceForm.length; j++) {
            if (targetLangformatted[start + j]?.text !== surfaceForm[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            for (let j = 0; j < surfaceForm.length; j++) {
              const index = start + j;
              const secondForIndex =
                isReadyForQuickReview && Number?.(getSecondForIndex(index));

              targetLangWithVocabStartIndex[index] = {
                ...targetLangWithVocabStartIndex[index],
                startIndex: vocabIdx,
                surfaceForm,
                meaning,
                secondForIndex,
                ...(sentenceId ? { sentenceId } : {}),
              };
            }
            start += surfaceForm.length;
          } else {
            start++;
          }
        }
      });
    }

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
