import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { useEffect } from 'react';

const useWordsStudyUIinit = ({
  setFormattedWordsStudyState,
  wordsForReviewMemoized,
  pureWordsMemoized,
  contentState,
  sentencesState,
  wordsState,
}) => {
  useEffect(() => {
    const slicedWords = wordsForReviewMemoized.slice(0, 6);
    const wordsDataWithContextData = slicedWords.map((item) => {
      let contextIds = item.contexts;

      const isNumericKeyObject =
        typeof contextIds === 'object' &&
        contextIds !== null &&
        !Array.isArray(contextIds) &&
        Object.keys(contextIds).every((key) => !isNaN(Number(key)));

      if (isNumericKeyObject) {
        contextIds = Object.values(contextIds);
      }
      const contextData = [];

      for (const contextId of contextIds ?? []) {
        for (const contentItem of contentState) {
          const thisContent = contentItem.content;

          const contextSentenceDataIndex = thisContent.findIndex(
            (contentSentence) => contentSentence.id === contextId,
          );

          const contextSentenceData = thisContent[contextSentenceDataIndex];

          if (contextSentenceData) {
            const previousSentence =
              contextSentenceDataIndex > 0
                ? {
                    ...thisContent[contextSentenceDataIndex - 1],
                    targetLangformatted: underlineWordsInSentence(
                      thisContent[contextSentenceDataIndex - 1].targetLang,
                      pureWordsMemoized,
                    ),
                  }
                : null;

            const nextSentence =
              contextSentenceDataIndex + 1 < thisContent.length
                ? {
                    ...thisContent[contextSentenceDataIndex + 1],
                    targetLangformatted: underlineWordsInSentence(
                      thisContent[contextSentenceDataIndex + 1].targetLang,
                      pureWordsMemoized,
                    ),
                  }
                : null;

            const totalObj = {
              ...contextSentenceData,
              title: contentItem?.title,
              generalTopicName: contentItem?.generalTopicName,
              isMedia: contentItem?.origin === 'youtube',
              targetLangformatted: underlineWordsInSentence(
                contextSentenceData.targetLang,
                pureWordsMemoized,
              ),
              contentIndex: contentItem.contentIndex,
              realStartTime: contentItem?.realStartTime,
              wordsFromSentence: findAllInstancesOfWordsInSentence(
                contextSentenceData.targetLang,
                wordsState,
              ),
              ...(previousSentence && { previousSentence }),
              ...(nextSentence && { nextSentence }),
            };

            contextData.push(totalObj);

            // Break inner loop since we found a match
            break;
          } else {
            const foundContextIdInAdhocSentences = sentencesState.find(
              (sentenceItem) => sentenceItem.id === contextId,
            );

            if (foundContextIdInAdhocSentences) {
              contextData.push({
                ...foundContextIdInAdhocSentences,
                isAdhoc: true,
                wordsFromSentence: findAllInstancesOfWordsInSentence(
                  foundContextIdInAdhocSentences.targetLang,
                  wordsState,
                ),
                targetLangformatted: underlineWordsInSentence(
                  foundContextIdInAdhocSentences.targetLang,
                  pureWordsMemoized,
                ),
              });
              break;
            }
          }
        }
      }

      return {
        ...item,
        generalTopicName: contextData?.[0]?.generalTopicName,
        contextData,
      };
    });

    setFormattedWordsStudyState(wordsDataWithContextData);
  }, [wordsForReviewMemoized]);
};

export default useWordsStudyUIinit;
